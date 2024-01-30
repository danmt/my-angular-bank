import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PublicKey } from '@solana/web3.js';
import { injectQueryParams } from 'ngxtension/inject-query-params';
import { lastValueFrom } from 'rxjs';
import { WalletService } from '../core';
import {
  ProcessTransactionModalComponent,
  ProcessTransactionModalData,
} from '../transfer';
import {
  config,
  createSolanaPayUrl,
  createTransferInstructions,
  toUserValue,
} from '../utils';
import { PayQrSectionComponent } from './pay-qr-section.component';
import { PaymentSectionComponent } from './payment-section.component';

@Component({
  selector: 'my-bank-payment-page',
  template: `
    <div class="flex gap-4 justify-center">
      <my-bank-payment-section
        [amount]="amount()"
        [memo]="memo()"
        [requester]="requester()"
        (approvePayment)="onApprovePayment()"
      ></my-bank-payment-section>

      <my-bank-pay-qr-section
        [solanaPayUrl]="solanaPayUrl()"
      ></my-bank-pay-qr-section>
    </div>
  `,
  imports: [PaymentSectionComponent, PayQrSectionComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class PaymentPageComponent {
  private readonly _matDialog = inject(MatDialog);
  private readonly _walletService = inject(WalletService);

  readonly amount = injectQueryParams((queryParams) => {
    const amount = queryParams['amount'];

    if (amount === undefined) {
      return null;
    }

    return Number(amount);
  });
  readonly memo = injectQueryParams('memo');
  readonly requester = injectQueryParams('requester');
  readonly solanaPayUrl = computed(() => {
    const amount = this.amount();
    const memo = this.memo();
    const requester = this.requester();

    if (amount === null || memo === null || requester === null) {
      return null;
    }

    return createSolanaPayUrl({
      receiver: requester,
      mint: config.mint,
      amount: toUserValue(amount),
      memo,
    });
  });

  async onApprovePayment() {
    try {
      const sender = await this._walletService.getOrConnectWallet();

      const amount = this.amount();
      const memo = this.memo();
      const requester = this.requester();

      if (amount === null || memo === null || requester === null) {
        throw new Error('Missing parameters for payment.');
      }

      await lastValueFrom(
        this._matDialog
          .open<
            ProcessTransactionModalComponent,
            ProcessTransactionModalData,
            string
          >(ProcessTransactionModalComponent, {
            data: {
              transactionInstructions: createTransferInstructions(
                sender,
                new PublicKey(requester),
                amount,
                memo,
              ),
            },
          })
          .afterClosed(),
      );
    } catch (error) {
      console.error('An error occured while transfering.', error);
    }
  }
}

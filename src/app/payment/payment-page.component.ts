import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { PublicKey } from '@solana/web3.js';
import { lastValueFrom } from 'rxjs';
import { WalletService } from '../core';
import {
  ProcessTransferModalComponent,
  ProcessTransferModalData,
} from '../transfer';
import { config, createSolanaPayUrl, toUserValue } from '../utils';
import { PayQrSectionComponent } from './pay-qr-section.component';
import { PaymentSectionComponent } from './payment-section.component';

@Component({
  standalone: true,
  imports: [PaymentSectionComponent, PayQrSectionComponent],
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
})
export class PaymentPageComponent {
  private readonly _matDialog = inject(MatDialog);
  private readonly _walletService = inject(WalletService);
  private readonly _activatedRoute = inject(ActivatedRoute);

  readonly queryParamMap = toSignal(this._activatedRoute.queryParamMap);
  readonly amount = computed(() => {
    const amount = this.queryParamMap()?.get('amount') ?? null;

    return amount ? Number(amount) : null;
  });
  readonly memo = computed(() => this.queryParamMap()?.get('memo') ?? null);
  readonly requester = computed(
    () => this.queryParamMap()?.get('requester') ?? null,
  );
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
            ProcessTransferModalComponent,
            ProcessTransferModalData,
            string
          >(ProcessTransferModalComponent, {
            data: {
              sender,
              amount,
              receiver: new PublicKey(requester),
              memo,
            },
          })
          .afterClosed(),
      );
    } catch (error) {
      console.error('An error occured while transfering.', error);
    }
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { lastValueFrom } from 'rxjs';
import { WalletService } from '../core';
import {
  PaymentRequestModalComponent,
  PaymentRequestModalData,
  RequestPaymentFormPayload,
  RequestPaymentModalComponent,
} from '../payment';
import {
  ProcessTransferModalComponent,
  ProcessTransferModalData,
  TransferFormPayload,
  TransferModalComponent,
} from '../transfer';
import { config, createSolanaPayUrl } from '../utils';
import { BalanceSectionComponent } from './balance-section.component';
import { BalanceStore } from './balance.store';
import { DepositQrSectionComponent } from './deposit-qr-section.component';
import { TransactionsSectionComponent } from './transactions-section.component';
import { TransactionsStore } from './transactions.store';

@Component({
  standalone: true,
  imports: [
    BalanceSectionComponent,
    DepositQrSectionComponent,
    TransactionsSectionComponent,
  ],
  selector: 'my-bank-balance-page',
  template: `
    <div class="flex gap-4 justify-center mb-4">
      <my-bank-balance-section
        [balance]="balance()"
        (reload)="onReload()"
        (requestPayment)="onRequestPayment()"
        (transfer)="onTransfer()"
      ></my-bank-balance-section>

      <my-bank-deposit-qr-section
        [solanaPayDepositUrl]="solanaPayDepositUrl()"
      ></my-bank-deposit-qr-section>
    </div>

    <div class="flex justify-center">
      <my-bank-transactions-section
        [transactions]="transactions()"
      ></my-bank-transactions-section>
    </div>
  `,
  providers: [BalanceStore, TransactionsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalancePageComponent {
  private readonly _matDialog = inject(MatDialog);
  private readonly _walletStore = inject(WalletStore);
  private readonly _walletService = inject(WalletService);
  private readonly _balanceStore = inject(BalanceStore);
  private readonly _transactionsStore = inject(TransactionsStore);

  readonly balance = this._balanceStore.balance;
  readonly publicKey = toSignal(this._walletStore.publicKey$);
  readonly solanaPayDepositUrl = computed(() => {
    const publicKey = this.publicKey();

    if (!publicKey) {
      return null;
    }

    return createSolanaPayUrl({
      receiver: publicKey.toBase58(),
      mint: config.mint,
    });
  });
  readonly transactions = this._transactionsStore.transactions;

  onReload() {
    this._balanceStore.reload();
    this._transactionsStore.reload();
  }

  async onTransfer() {
    try {
      const transferPayload = await lastValueFrom(
        this._matDialog
          .open<TransferModalComponent, {}, TransferFormPayload>(
            TransferModalComponent,
          )
          .afterClosed(),
      );

      if (transferPayload) {
        const sender = await this._walletService.getOrConnectWallet();

        await lastValueFrom(
          this._matDialog
            .open<
              ProcessTransferModalComponent,
              ProcessTransferModalData,
              string
            >(ProcessTransferModalComponent, {
              data: {
                sender,
                amount: transferPayload.amount,
                receiver: new PublicKey(transferPayload.receiver),
                memo: transferPayload.memo,
              },
            })
            .afterClosed(),
        );
      }
    } catch (error) {
      console.error('An error occured while transfering.', error);
    }
  }

  async onRequestPayment() {
    try {
      const requester = await this._walletService.getOrConnectWallet();
      const requestPaymentPayload = await lastValueFrom(
        this._matDialog
          .open<RequestPaymentModalComponent, {}, RequestPaymentFormPayload>(
            RequestPaymentModalComponent,
          )
          .afterClosed(),
      );

      if (requestPaymentPayload) {
        await lastValueFrom(
          this._matDialog
            .open<PaymentRequestModalComponent, PaymentRequestModalData>(
              PaymentRequestModalComponent,
              {
                data: {
                  amount: requestPaymentPayload.amount,
                  memo: requestPaymentPayload.memo,
                  requester: requester,
                },
              },
            )
            .afterClosed(),
        );
      }
    } catch (error) {
      console.error('An error occured while requesting payment.', error);
    }
  }
}

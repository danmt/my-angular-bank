import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { PublicKey } from '@solana/web3.js';
import { computedFrom } from 'ngxtension/computed-from';
import { lastValueFrom, map } from 'rxjs';
import { WalletService } from '../core';
import {
  PaymentRequestModalComponent,
  PaymentRequestModalData,
  RequestPaymentFormPayload,
  RequestPaymentModalComponent,
} from '../payment';
import {
  ProcessTransactionModalComponent,
  ProcessTransactionModalData,
  TransferFormPayload,
  TransferModalComponent,
} from '../transfer';
import {
  config,
  createSolanaPayUrl,
  createTransferInstructions,
} from '../utils';
import { BalanceSectionComponent } from './balance-section.component';
import { BalanceStore } from './balance.store';
import { DepositQrSectionComponent } from './deposit-qr-section.component';
import { TransactionsSectionComponent } from './transactions-section.component';
import { TransactionsStore } from './transactions.store';

@Component({
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
  imports: [
    BalanceSectionComponent,
    DepositQrSectionComponent,
    TransactionsSectionComponent,
  ],
  providers: [BalanceStore, TransactionsStore],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class BalancePageComponent {
  private readonly _matDialog = inject(MatDialog);
  private readonly _walletStore = inject(WalletStore);
  private readonly _walletService = inject(WalletService);
  private readonly _balanceStore = inject(BalanceStore);
  private readonly _transactionsStore = inject(TransactionsStore);

  readonly balance = this._balanceStore.balance;
  readonly solanaPayDepositUrl = computedFrom(
    [this._walletStore.publicKey$],
    map(([publicKey]) => {
      if (publicKey === null) {
        return null;
      }

      return createSolanaPayUrl({
        receiver: publicKey.toBase58(),
        mint: config.mint,
      });
    }),
  );
  readonly publicKey = toSignal(this._walletStore.publicKey$, {
    initialValue: null,
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
              ProcessTransactionModalComponent,
              ProcessTransactionModalData,
              string
            >(ProcessTransactionModalComponent, {
              data: {
                transactionInstructions: createTransferInstructions(
                  sender,
                  new PublicKey(transferPayload.receiver),
                  transferPayload.amount,
                  transferPayload.memo,
                ),
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

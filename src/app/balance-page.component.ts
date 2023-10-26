import { DecimalPipe, NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { HdWalletAdapterDirective } from '@heavy-duty/wallet-adapter-cdk';
import { LetDirective } from '@ngrx/component';
import { getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { QRCodeModule } from 'angularx-qrcode';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  lastValueFrom,
  map,
} from 'rxjs';
import { config } from './config';
import {
  PaymentRequestModalComponent,
  PaymentRequestModalData,
} from './payment-request-modal.component';
import {
  ProcessingTransferModalComponent,
  ProcessingTransferModalData,
} from './processing-transfer-modal.component';
import { RequestPaymentFormPayload } from './request-payment-form.component';
import { RequestPaymentModalComponent } from './request-payment-modal.component';
import { ToUserValuePipe } from './to-user-value.pipe';
import { TransferFormPayload } from './transfer-form.component';
import { TransferModalComponent } from './transfer-modal.component';
import { WalletService } from './wallet.service';

@Component({
  standalone: true,
  imports: [
    NgIf,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    LetDirective,
    QRCodeModule,
    HdWalletAdapterDirective,
    ToUserValuePipe,
  ],
  selector: 'my-bank-balance-page',
  template: `
    <div class="flex gap-4 justify-center">
      <mat-card class="px-4 py-8 w-[500px] flex flex-col">
        <header class="mb-4">
          <h2 class="text-3xl text-center">Balance</h2>
        </header>

        <div
          *ngrxLet="balance$; let balance"
          class="grow flex justify-center items-center gap-2 mb-4"
        >
          <img src="assets/usdc-logo.png" class="w-24 h-24" />

          <p class="text-7xl">
            <ng-container *ngIf="balance !== null; else balanceNotFound">
              {{ balance | hdToUserValue : 6 | number : '2.2-2' }}
            </ng-container>
            <ng-template #balanceNotFound>-</ng-template>
          </p>
        </div>

        <footer class="flex justify-center gap-2">
          <button (click)="onTransfer()" mat-raised-button color="primary">
            Transfer
          </button>

          <button
            (click)="onRequestPayment()"
            mat-raised-button
            color="primary"
          >
            Request Payment
          </button>
        </footer>
      </mat-card>

      <mat-card class="px-4 py-8 w-[400px]">
        <header class="mb-4">
          <h2 class="text-3xl text-center">Deposit using Solana Pay</h2>
        </header>

        <div
          *ngrxLet="solanaPayDepositUrl$; let solanaPayDepositUrl"
          class="flex justify-center"
        >
          <qrcode
            *ngIf="solanaPayDepositUrl !== null; else walletNotConnected"
            [qrdata]="solanaPayDepositUrl"
            [width]="256"
            [margin]="0"
            [errorCorrectionLevel]="'M'"
          ></qrcode>

          <ng-template #walletNotConnected>
            <div
              class="w-[256px] h-[256px] bg-black bg-opacity-10 p-4 flex justify-center items-center"
            >
              <p class="text-center italic text-sm">
                Connect wallet to view QR Code
              </p>
            </div>
          </ng-template>
        </div>
      </mat-card>
    </div>
  `,
  styles: [],
})
export class BalancePageComponent {
  private readonly _walletStore = inject(WalletStore);
  private readonly _connectionStore = inject(ConnectionStore);
  private readonly _matDialog = inject(MatDialog);
  private readonly _reload = new BehaviorSubject(null);
  private readonly _walletService = inject(WalletService);

  readonly reload$ = this._reload.asObservable();
  readonly balance$ = combineLatest([
    this.reload$,
    this._connectionStore.connection$,
    this._walletStore.publicKey$,
  ]).pipe(
    concatMap(async ([, connection, publicKey]) => {
      if (!publicKey || !connection) {
        return null;
      }

      const associatedTokenPubkey = getAssociatedTokenAddressSync(
        new PublicKey(config.mint),
        publicKey
      );
      const associatedTokenAccount = await getAccount(
        connection,
        associatedTokenPubkey
      );

      if (!associatedTokenAccount) {
        return 0;
      }

      return Number(associatedTokenAccount.amount);
    })
  );
  readonly solanaPayDepositUrl$ = this._walletStore.publicKey$.pipe(
    map((publicKey) => {
      if (!publicKey) {
        return null;
      }

      const url = new URL(`solana:${publicKey.toBase58()}`);

      url.searchParams.append('spl-token', config.mint);

      return url.toString();
    })
  );

  async onTransfer() {
    const sender = await this._walletService.getOrConnectWallet();
    const transferPayload = await lastValueFrom(
      this._matDialog
        .open<TransferModalComponent, {}, TransferFormPayload>(
          TransferModalComponent
        )
        .afterClosed()
    );

    if (transferPayload) {
      await lastValueFrom(
        this._matDialog
          .open<
            ProcessingTransferModalComponent,
            ProcessingTransferModalData,
            string
          >(ProcessingTransferModalComponent, {
            data: {
              sender,
              receiver: new PublicKey(transferPayload.receiver),
              amount: transferPayload.amount,
              memo: transferPayload.memo,
            },
          })
          .afterClosed()
      );
    }
  }

  async onRequestPayment() {
    const requester = await this._walletService.getOrConnectWallet();
    const requestPaymentPayload = await lastValueFrom(
      this._matDialog
        .open<RequestPaymentModalComponent, {}, RequestPaymentFormPayload>(
          RequestPaymentModalComponent
        )
        .afterClosed()
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
            }
          )
          .afterClosed()
      );
    }
  }
}

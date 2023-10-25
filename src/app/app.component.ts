import { DecimalPipe, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import {
  ConnectionStore,
  Wallet,
  WalletStore,
} from '@heavy-duty/wallet-adapter';
import {
  HdSelectAndConnectWalletDirective,
  HdWalletAdapterDirective,
} from '@heavy-duty/wallet-adapter-cdk';
import {
  HdWalletModalComponent,
  HdWalletModalTriggerDirective,
  HdWalletMultiButtonComponent,
} from '@heavy-duty/wallet-adapter-material';
import { LetDirective } from '@ngrx/component';
import { getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { WalletName } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import {
  BehaviorSubject,
  combineLatest,
  concatMap,
  firstValueFrom,
  lastValueFrom,
} from 'rxjs';
import {
  PaymentRequestModalComponent,
  PaymentRequestModalData,
} from './payment-request-modal.component';
import { RequestPaymentFormPayload } from './request-payment-form.component';
import { RequestPaymentModalComponent } from './request-payment-modal.component';
import { ToUserValuePipe } from './to-user-value.pipe';
import { TransferModalComponent } from './transfer-modal.component';

@Component({
  standalone: true,
  imports: [
    NgIf,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    LetDirective,
    HdWalletMultiButtonComponent,
    HdWalletModalTriggerDirective,
    HdWalletAdapterDirective,
    HdSelectAndConnectWalletDirective,
    ToUserValuePipe,
  ],
  selector: 'my-bank-root',
  template: `
    <mat-card class="mx-auto my-8 px-4 py-8 w-full max-w-[500px]">
      <header class="mb-8">
        <h1 class="text-5xl text-center mb-4">My Bank</h1>

        <div class="flex justify-center">
          <hd-wallet-multi-button></hd-wallet-multi-button>
        </div>
      </header>

      <main>
        <div *ngrxLet="balance$; let balance">
          <h2 class="text-2xl text-center mb-4">Balance</h2>

          <div class="flex justify-center items-center gap-2 mb-4">
            <img src="assets/usdc-logo.png" class="w-12 h-12" />

            <p class="text-4xl">
              <ng-container *ngIf="balance !== null; else balanceNotFound">
                {{ balance | hdToUserValue : 6 | number : '2.2-2' }}
              </ng-container>
              <ng-template #balanceNotFound>-</ng-template>
            </p>
          </div>

          <div
            *hdWalletAdapter="let publicKey = publicKey; let wallets = wallets"
            class="flex justify-center gap-2"
          >
            <button
              (click)="
                publicKey ? onTransfer() : hdWalletModalTrigger.open(wallets)
              "
              mat-raised-button
              color="primary"
              hdSelectAndConnectWallet
              #hdSelectAndConnectWallet="hdSelectAndConnectWallet"
              hdWalletModalTrigger
              #hdWalletModalTrigger="hdWalletModalTrigger"
              (hdSelectWallet)="hdSelectAndConnectWallet.run($event)"
              (hdWalletConnected)="onTransfer()"
            >
              Transfer
            </button>

            <button
              (click)="onRequestPayment()"
              mat-raised-button
              color="primary"
            >
              Request Payment
            </button>
          </div>
        </div>
      </main>
    </mat-card>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  private readonly _walletStore = inject(WalletStore);
  private readonly _connectionStore = inject(ConnectionStore);
  private readonly _matDialog = inject(MatDialog);
  private readonly _reload = new BehaviorSubject(null);

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
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
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

  ngOnInit() {
    this._connectionStore.setEndpoint(
      'https://rpc.helius.xyz/?api-key=063bb60d-5399-4d9f-a95c-29082d0d2dd0'
    );
  }

  onTransfer() {
    this._matDialog
      .open(TransferModalComponent, {})
      .afterClosed()
      .subscribe((success) => {
        if (success) {
          this._reload.next(null);
        }
      });
  }

  async onRequestPayment() {
    let requesterWalletPubkey = await firstValueFrom(
      this._walletStore.publicKey$
    );

    if (!requesterWalletPubkey) {
      const wallets = await firstValueFrom(this._walletStore.wallets$);
      const walletName = await lastValueFrom(
        this._matDialog
          .open<HdWalletModalComponent, { wallets: Wallet[] }, WalletName>(
            HdWalletModalComponent,
            {
              panelClass: ['wallet-modal'],
              maxWidth: '380px',
              maxHeight: '90vh',
              data: {
                wallets,
              },
            }
          )
          .afterClosed()
      );

      if (!walletName) {
        return;
      }

      this._walletStore.selectWallet(walletName);
      await firstValueFrom(this._walletStore.connect());

      requesterWalletPubkey = await firstValueFrom(
        this._walletStore.publicKey$
      );

      if (!requesterWalletPubkey) {
        throw new Error('Wallet not connected');
      }
    }

    const requestPaymentPayload = await lastValueFrom(
      this._matDialog
        .open<RequestPaymentModalComponent, {}, RequestPaymentFormPayload>(
          RequestPaymentModalComponent,
          {}
        )
        .afterClosed()
    );

    if (!requestPaymentPayload) {
      return;
    }

    await lastValueFrom(
      this._matDialog
        .open<PaymentRequestModalComponent, PaymentRequestModalData>(
          PaymentRequestModalComponent,
          {
            data: {
              amount: 100,
              memo: 'hello world',
              requesterPublicKey: PublicKey.default,
            },
          }
        )
        .afterClosed()
    );
  }
}

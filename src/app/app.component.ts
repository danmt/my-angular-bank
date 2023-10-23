import { DecimalPipe, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import {
  HdSelectAndConnectWalletDirective,
  HdWalletAdapterDirective,
} from '@heavy-duty/wallet-adapter-cdk';
import {
  HdWalletModalTriggerDirective,
  HdWalletMultiButtonComponent,
} from '@heavy-duty/wallet-adapter-material';
import { LetDirective } from '@ngrx/component';
import { getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { BehaviorSubject, combineLatest, concatMap } from 'rxjs';
import { ToUserValuePipe } from './to-user-value.pipe';
import { TransferModalComponent } from './transfer-modal.component';

@Component({
  standalone: true,
  imports: [
    NgIf,
    DecimalPipe,
    MatButtonModule,
    LetDirective,
    HdWalletMultiButtonComponent,
    HdWalletModalTriggerDirective,
    HdWalletAdapterDirective,
    HdSelectAndConnectWalletDirective,
    ToUserValuePipe,
  ],
  selector: 'my-bank-root',
  template: `
    <header>
      <h1>My Bank</h1>

      <hd-wallet-multi-button></hd-wallet-multi-button>
    </header>

    <main>
      <div *ngrxLet="balance$; let balance">
        <h2 class="text-center">Balance</h2>

        <div class="flex justify-center items-center gap-2">
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
        </div>
      </div>
    </main>
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
}

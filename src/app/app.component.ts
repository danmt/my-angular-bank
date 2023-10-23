import { DecimalPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { HdWalletMultiButtonComponent } from '@heavy-duty/wallet-adapter-material';
import { LetDirective } from '@ngrx/component';
import { getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { concatMap } from 'rxjs';
import { ToUserValuePipe } from './to-user-value.pipe';

@Component({
  standalone: true,
  imports: [
    DecimalPipe,
    RouterModule,
    LetDirective,
    HdWalletMultiButtonComponent,
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
        <h2>Balance</h2>

        <div class="flex justify-center items-center gap-2">
          <img src="assets/usdc-logo.png" class="w-12 h-12" />

          <p class="text-4xl">
            {{ balance | hdToUserValue : 6 | number : '2.2-2' }}
          </p>
        </div>
      </div>
    </main>
  `,
  styles: [],
})
export class AppComponent {
  private readonly _walletStore = inject(WalletStore);

  readonly balance$ = this._walletStore.publicKey$.pipe(
    concatMap(async (publicKey) => {
      if (!publicKey) {
        return 0;
      }

      const usdcAssociatedTokenPubkey = getAssociatedTokenAddressSync(
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        publicKey
      );
      const connection = new Connection(
        'https://rpc.helius.xyz/?api-key=063bb60d-5399-4d9f-a95c-29082d0d2dd0',
        'confirmed'
      );
      const usdcAssociatedTokenAccount = await getAccount(
        connection,
        usdcAssociatedTokenPubkey
      );

      if (!usdcAssociatedTokenAccount) {
        return 0;
      }

      return Number(usdcAssociatedTokenAccount.amount);
    })
  );
}

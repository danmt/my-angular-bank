import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Wallet, WalletStore } from '@heavy-duty/wallet-adapter';
import { HdWalletModalComponent } from '@heavy-duty/wallet-adapter-material';
import { WalletName } from '@solana/wallet-adapter-base';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly _walletStore = inject(WalletStore);
  private readonly _matDialog = inject(MatDialog);

  async getOrConnectWallet() {
    let walletPubkey = await firstValueFrom(this._walletStore.publicKey$);

    if (!walletPubkey) {
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
        throw new Error('Wallet not selected');
      }

      this._walletStore.selectWallet(walletName);
      await firstValueFrom(this._walletStore.connect());

      walletPubkey = await firstValueFrom(this._walletStore.publicKey$);

      if (!walletPubkey) {
        throw new Error('Wallet not connected');
      }
    }

    return walletPubkey;
  }
}

import { Injectable, inject } from '@angular/core';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { Connection, PublicKey } from '@solana/web3.js';
import { BehaviorSubject, concatMap } from 'rxjs';
import { config } from '../utils';

export interface BalanceState {
  balance: number | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable()
export class BalanceStore extends ComponentStore<BalanceState> {
  private readonly _walletStore = inject(WalletStore);
  private readonly _connectionStore = inject(ConnectionStore);
  private readonly _reload = new BehaviorSubject(null);

  readonly balance$ = this.select((state) => state.balance);

  private readonly _loadBalance = this.effect<{
    connection: Connection | null;
    publicKey: PublicKey | null;
  }>(
    concatMap(async ({ connection, publicKey }) => {
      this.patchState({ isLoading: true, balance: null, error: null });

      if (!publicKey || !connection) {
        this.patchState({ isLoading: false });
        return;
      }

      const associatedTokenPubkey = getAssociatedTokenAddressSync(
        new PublicKey(config.mint),
        publicKey
      );

      try {
        const associatedTokenAccount = await getAccount(
          connection,
          associatedTokenPubkey
        );

        if (!associatedTokenAccount) {
          this.patchState({ balance: 0 });
        } else {
          this.patchState({ balance: Number(associatedTokenAccount.amount) });
        }
      } catch (error) {
        if (typeof error === 'string') {
          this.patchState({ error });
        } else if (error instanceof Error) {
          this.patchState({ error: error.message });
        } else {
          this.patchState({ error: JSON.stringify(error) });
        }
      } finally {
        this.patchState({ isLoading: false });
      }
    })
  );

  constructor() {
    super({
      balance: null,
      error: null,
      isLoading: false,
    });

    this._loadBalance(
      this.select(
        this._walletStore.publicKey$,
        this._connectionStore.connection$,
        this._reload.asObservable(),
        (publicKey, connection) => ({ publicKey, connection })
      )
    );
  }

  reload() {
    this._reload.next(null);
  }
}

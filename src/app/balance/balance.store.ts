import { Injectable, computed, inject, signal } from '@angular/core';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { computedFrom } from 'ngxtension/computed-from';
import { catchError, from, map, of, pipe, startWith, switchMap } from 'rxjs';
import { config, stringifyError } from '../utils';

export interface BalanceState {
  balance: number | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable()
export class BalanceStore {
  private readonly _walletStore = inject(WalletStore);
  private readonly _connectionStore = inject(ConnectionStore);
  private readonly _reload = signal(Date.now());

  readonly state = computedFrom(
    [
      this._walletStore.publicKey$,
      this._connectionStore.connection$,
      this._reload,
    ],
    pipe(
      switchMap(([publicKey, connection]) => {
        if (!publicKey || !connection) {
          return of({ isLoading: false as const, error: null, balance: 0 });
        }

        const associatedTokenPubkey = getAssociatedTokenAddressSync(
          new PublicKey(config.mint),
          publicKey,
        );

        return from(getAccount(connection, associatedTokenPubkey)).pipe(
          map((associatedTokenAccount) => ({
            isLoading: false as const,
            error: null,
            balance: associatedTokenAccount
              ? Number(associatedTokenAccount.amount)
              : 0,
          })),
          startWith({
            isLoading: true as const,
            balance: null,
            error: null,
          }),
          catchError((error) =>
            of({
              error: stringifyError(error),
              balance: null,
              isLoading: false as const,
            }),
          ),
        );
      }),
    ),
  );
  readonly balance = computed(() => this.state().balance);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);

  reload() {
    this._reload.set(Date.now());
  }
}

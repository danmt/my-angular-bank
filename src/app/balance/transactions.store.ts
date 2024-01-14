import { Injectable, computed, inject, signal } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { computedFrom } from 'ngxtension/computed-from';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ShyftApiService } from '../core';
import { Transaction, config, stringifyError } from '../utils';

export interface TransactionsState {
  transactions: Transaction[] | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable()
export class TransactionsStore {
  private readonly _shyftApiService = inject(ShyftApiService);
  private readonly _walletStore = inject(WalletStore);
  private readonly _reload = signal(Date.now());

  readonly state = computedFrom(
    [this._walletStore.publicKey$, this._reload],
    switchMap(([publicKey]) => {
      if (!publicKey) {
        return of({
          isLoading: false as const,
          transactions: null,
          error: null,
        });
      }

      const associatedTokenPubkey = getAssociatedTokenAddressSync(
        new PublicKey(config.mint),
        publicKey,
      );

      return this._shyftApiService.getTransactions(associatedTokenPubkey).pipe(
        map((transactions) => ({
          isLoading: false as const,
          transactions,
          error: null,
        })),
        startWith({
          isLoading: true as const,
          transactions: null,
          error: null,
        }),
        catchError((error) =>
          of({
            isLoading: false as const,
            transactions: null,
            error: stringifyError(error),
          }),
        ),
      );
    }),
  );
  readonly transactions = computed(() => this.state().transactions);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);

  reload() {
    this._reload.set(Date.now());
  }
}

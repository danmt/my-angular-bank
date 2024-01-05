import { Injectable, computed, inject, signal } from '@angular/core';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { computedFrom } from 'ngxtension/computed-from';
import { catchError, from, map, of, startWith, switchMap } from 'rxjs';
import { Transaction, TransactionApiService } from '../core';
import { stringifyError } from '../utils';

export interface TransactionsState {
  transactions: Transaction[] | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable()
export class TransactionsStore {
  private readonly _transactionApiService = inject(TransactionApiService);
  private readonly _walletStore = inject(WalletStore);
  private readonly _connectionStore = inject(ConnectionStore);
  private readonly _reload = signal(Date.now());

  readonly state = computedFrom(
    [
      this._walletStore.publicKey$,
      this._connectionStore.connection$,
      this._reload,
    ],
    switchMap(([publicKey, connection]) => {
      if (!publicKey || !connection) {
        return of({
          isLoading: false as const,
          transactions: null,
          error: null,
        });
      }

      return from(this._transactionApiService.getTransactions(publicKey)).pipe(
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

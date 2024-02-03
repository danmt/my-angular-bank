import { Injectable, computed, inject, signal } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { computedFrom } from 'ngxtension/computed-from';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ShyftApiService } from '../core';
import { stringifyError } from '../utils';

export interface BalanceState {
  balance: number | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable()
export class BalanceStore {
  private readonly _shyftApiService = inject(ShyftApiService);
  private readonly _walletStore = inject(WalletStore);
  private readonly _reload = signal(Date.now());

  readonly state = computedFrom(
    [this._walletStore.publicKey$, this._reload],
    switchMap(([publicKey]) => {
      if (!publicKey) {
        return of({ isLoading: false as const, error: null, balance: 0 });
      }

      return this._shyftApiService.getAccount(publicKey).pipe(
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
  );
  readonly balance = computed(() => this.state().balance);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);

  reload() {
    this._reload.set(Date.now());
  }
}

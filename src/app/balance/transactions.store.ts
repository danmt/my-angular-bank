import { Injectable, inject } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { ComponentStore } from '@ngrx/component-store';
import { PublicKey } from '@solana/web3.js';
import { BehaviorSubject, concatMap } from 'rxjs';
import { Transaction, TransactionApiService } from '../core';

export interface TransactionsState {
  transactions: Transaction[] | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable()
export class TransactionsStore extends ComponentStore<TransactionsState> {
  private readonly _walletStore = inject(WalletStore);
  private readonly _reload = new BehaviorSubject(null);
  private readonly _transactionApiService = inject(TransactionApiService);

  readonly transactions$ = this.select((state) => state.transactions);

  private readonly _loadTransactions = this.effect<{
    publicKey: PublicKey | null;
  }>(
    concatMap(async ({ publicKey }) => {
      this.patchState({ isLoading: true, transactions: null, error: null });

      if (!publicKey) {
        this.patchState({ isLoading: false });
        return;
      }

      try {
        const transactions = await this._transactionApiService.getTransactions(
          publicKey
        );

        this.patchState({ transactions });
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
      transactions: null,
      error: null,
      isLoading: false,
    });

    this._loadTransactions(
      this.select(
        this._walletStore.publicKey$,
        this._reload.asObservable(),
        (publicKey) => ({ publicKey })
      )
    );
  }

  reload() {
    this._reload.next(null);
  }
}

import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { Transaction, TransactionApiService } from '../core';

export interface TransactionsState {
  transactions: Transaction[] | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable()
export class TransactionsStore {
  private readonly _walletStore = inject(WalletStore);
  private readonly _reload = signal(Date.now());
  private readonly _transactionApiService = inject(TransactionApiService);

  private readonly _publicKey = toSignal(this._walletStore.publicKey$, {
    initialValue: null,
  }); // Temporal
  private readonly state = signal<TransactionsState>({
    transactions: null,
    error: null,
    isLoading: false,
  });

  readonly transactions = computed(() => this.state().transactions);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);

  readonly loadTransactions = effect(
    async () => {
      this._reload();

      this.state.set({
        isLoading: true,
        transactions: null,
        error: null,
      });

      const publicKey = this._publicKey();

      if (!publicKey) {
        this.state.update((state) => ({ ...state, isLoading: false }));
        return;
      }

      try {
        const transactions =
          await this._transactionApiService.getTransactions(publicKey);

        this.state.update((state) => ({ ...state, transactions }));
      } catch (err) {
        const error = err;

        if (typeof error === 'string') {
          this.state.update((state) => ({ ...state, error }));
        } else if (error instanceof Error) {
          this.state.update((state) => ({ ...state, error: error.message }));
        } else {
          this.state.update((state) => ({
            ...state,
            error: JSON.stringify(error),
          }));
        }
      } finally {
        this.state.update((state) => ({ ...state, isLoading: false }));
      }
    },
    { allowSignalWrites: true },
  );

  reload() {
    this._reload.set(Date.now());
  }
}

import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { getAccount, getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { config } from '../utils';

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

  // Temporal:
  private readonly _publicKey = toSignal(this._walletStore.publicKey$, {
    initialValue: null,
  });
  private readonly _connection = toSignal(this._connectionStore.connection$, {
    initialValue: null,
  });

  readonly state = signal<BalanceState>({
    balance: null,
    error: null,
    isLoading: false,
  });
  readonly balance = computed(() => this.state().balance);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);
  readonly loadBalance = effect(
    async () => {
      this._reload();

      this.state.set({
        isLoading: true,
        balance: null,
        error: null,
      });

      const publicKey = this._publicKey();
      const connection = this._connection();

      if (!publicKey || !connection) {
        this.state.update((state) => ({ ...state, isLoading: false }));
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
          this.state.update((state) => ({ ...state, balance: 0 }));
        } else {
          this.state.update((state) => ({
            ...state,
            balance: Number(associatedTokenAccount.amount),
          }));
        }
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
    {
      allowSignalWrites: true,
    }
  );

  reload() {
    this._reload.set(Date.now());
  }
}

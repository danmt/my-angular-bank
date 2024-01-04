import { Injectable, computed, inject, signal } from '@angular/core';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import {
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { computedFrom } from 'ngxtension/computed-from';
import { catchError, from, map, of, pipe, startWith, switchMap } from 'rxjs';
import { stringifyError } from '../utils';

@Injectable()
export class ProcessTransactionStore {
  private readonly _walletStore = inject(WalletStore);
  private readonly _connectionStore = inject(ConnectionStore);
  private readonly _transactionInstructions = signal<
    TransactionInstruction[] | null
  >(null);

  readonly latestBlockhash = computedFrom(
    [this._connectionStore.connection$, this._transactionInstructions],
    pipe(
      switchMap(([connection, transactionInstructions]) => {
        if (connection === null || transactionInstructions === null) {
          return of(null);
        }

        return from(connection.getLatestBlockhash('confirmed'));
      }),
      startWith(null),
    ),
  );
  readonly transaction = computedFrom(
    [
      this._walletStore.publicKey$,
      this._transactionInstructions,
      this.latestBlockhash,
    ],
    pipe(
      map(([publicKey, transactionInstructions, latestBlockhash]) => {
        if (
          latestBlockhash === null ||
          transactionInstructions === null ||
          publicKey === null
        ) {
          return null;
        }

        const transactionMessage = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions: transactionInstructions,
        }).compileToV0Message();

        return new VersionedTransaction(transactionMessage);
      }),
    ),
  );
  readonly transactionResponse = computedFrom(
    [this._connectionStore.connection$, this.transaction],
    pipe(
      switchMap(([connection, transaction]) => {
        if (connection === null || transaction === null) {
          return of({
            isLoading: false as const,
            signature: null,
            error: null,
          });
        }

        return from(
          this._walletStore.sendTransaction(transaction, connection, {
            maxRetries: 5,
          }),
        ).pipe(
          map((signature) => ({
            isLoading: false as const,
            signature,
            error: null,
          })),
          startWith({
            isLoading: true as const,
            signature: null,
            error: null,
          }),
          catchError((error) =>
            of({
              isLoading: false as const,
              signature: null,
              error: stringifyError(error),
            }),
          ),
        );
      }),
    ),
  );
  readonly transactionConfirmation = computedFrom(
    [
      this._connectionStore.connection$,
      this.transactionResponse,
      this.latestBlockhash,
    ],
    pipe(
      switchMap(([connection, transactionResponse, latestBlockhash]) => {
        if (
          connection === null ||
          transactionResponse?.signature === null ||
          latestBlockhash === null
        ) {
          return of({
            isLoading: false as const,
            confirmation: null,
            error: null,
          });
        }

        return from(
          connection.confirmTransaction({
            signature: transactionResponse.signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
          }),
        ).pipe(
          map((confirmation) => {
            if (confirmation.value.err) {
              return {
                isLoading: false as const,
                confirmation: null,
                error: confirmation.value.err.toString(),
              };
            }

            return {
              isLoading: false as const,
              confirmation,
              error: null,
            };
          }),
          startWith({
            isLoading: true as const,
            confirmation: null,
            error: null,
          }),
          catchError((error) =>
            of({
              isLoading: false as const,
              confirmation: null,
              error: stringifyError(error),
            }),
          ),
        );
      }),
    ),
  );
  readonly transactionStatus = computed(() => {
    if (this.transactionConfirmation().confirmation) {
      return 'confirmed' as const;
    } else if (
      this.transactionResponse().error ||
      this.transactionConfirmation().error
    ) {
      return 'failed' as const;
    } else if (this.transactionResponse().signature) {
      return 'confirming' as const;
    } else if (this.transaction()) {
      return 'sending' as const;
    } else {
      return 'pending' as const;
    }
  });
  readonly isRunning = computed(
    () =>
      this.transactionStatus() !== 'confirmed' &&
      this.transactionStatus() !== 'failed',
  );
  readonly error = computed(
    () =>
      this.transactionConfirmation().error ??
      this.transactionResponse().error ??
      null,
  );

  setTransactionInstructions(
    transactionInstructions: TransactionInstruction[],
  ) {
    this._transactionInstructions.set(transactionInstructions);
  }
}

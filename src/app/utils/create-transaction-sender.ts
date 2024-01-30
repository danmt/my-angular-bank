import { WritableSignal, signal } from '@angular/core';
import { SendTransactionOptions } from '@solana/wallet-adapter-base';
import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  TransactionMessage,
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js';
import { Observable, firstValueFrom } from 'rxjs';
import { stringifyError } from '../utils';

export type TransactionState =
  | {
      status: 'pending';
      signature: null;
      error: null;
    }
  | {
      status: 'sending';
      signature: null;
      error: null;
    }
  | {
      status: 'confirming';
      signature: TransactionSignature;
      error: null;
    }
  | {
      status: 'confirmed';
      signature: TransactionSignature;
      error: null;
      explorerUrl: string;
    }
  | {
      status: 'failed';
      signature: null;
      error: string;
    };

export type TransactionStatus = TransactionState['status'];

export type SendFunction = (
  connection: Connection,
  publicKey: PublicKey,
  transactionInstructions: TransactionInstruction[],
) => Promise<TransactionSignature>;

export type TransactionSenderSignal = WritableSignal<TransactionState> & {
  send: SendFunction;
};

export function toTransactionSenderSignal(
  signal: WritableSignal<TransactionState>,
  sendFn: SendFunction,
): TransactionSenderSignal {
  Object.defineProperty(signal, 'send', {
    value: sendFn,
    writable: false,
  });

  return signal as TransactionSenderSignal;
}

export function createTransactionSender(
  sendTransactionFn: (
    transaction: Transaction | VersionedTransaction,
    connection: Connection,
    options?: SendTransactionOptions,
  ) => Observable<TransactionSignature>,
): TransactionSenderSignal {
  const state = signal<TransactionState>({
    status: 'pending',
    signature: null,
    error: null,
  });

  return toTransactionSenderSignal(
    state,
    async (
      connection: Connection,
      publicKey: PublicKey,
      transactionInstructions: TransactionInstruction[],
    ) => {
      try {
        state.set({
          status: 'sending',
          signature: null,
          error: null,
        });

        const latestBlockhash =
          await connection.getLatestBlockhash('confirmed');
        const transactionMessage = new TransactionMessage({
          payerKey: publicKey,
          recentBlockhash: latestBlockhash.blockhash,
          instructions: transactionInstructions,
        }).compileToV0Message();
        const transaction = new VersionedTransaction(transactionMessage);

        const signature = await firstValueFrom(
          sendTransactionFn(transaction, connection, {
            maxRetries: 5,
          }),
        );

        state.set({
          status: 'confirming',
          signature,
          error: null,
        });

        const confirmation = await connection.confirmTransaction({
          signature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

        if (confirmation.value.err) {
          throw new Error('Confirmation failed.');
        }

        state.set({
          status: 'confirmed',
          signature,
          error: null,
          explorerUrl: `https://explorer.solana.com/tx/${signature}`,
        });

        return signature;
      } catch (error) {
        state.set({
          status: 'failed',
          signature: null,
          error: stringifyError(error),
        });
        throw error;
      }
    },
  );
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { BehaviorSubject, firstValueFrom, lastValueFrom } from 'rxjs';
import { config } from '../utils';

export type Transaction = {
  timestamp: Date;
} & (
  | {
      type: 'unknown';
    }
  | {
      type: 'transfer';
      memo: string;
      amount: number;
      sign: 1 | -1;
    }
);

@Injectable({ providedIn: 'root' })
export class TransactionApiService {
  private readonly _httpClient = inject(HttpClient);
  private readonly _shyftApiKey = new BehaviorSubject(
    localStorage.getItem('shyftApiKey') ?? config.shyftApiKey
  );

  readonly shyftApiKey$ = this._shyftApiKey.asObservable();

  setShyftApiKey(shyftApiKey: string) {
    this._shyftApiKey.next(shyftApiKey);
    localStorage.setItem('shyftApiKey', shyftApiKey);
  }

  async getTransactions(publicKey: PublicKey): Promise<Transaction[]> {
    const shyftApiKey = await firstValueFrom(this.shyftApiKey$);
    const associatedTokenPubkey = getAssociatedTokenAddressSync(
      new PublicKey(config.mint),
      publicKey
    );

    const url = new URL('https://api.shyft.to/sol/v1/transaction/history');

    url.searchParams.append('network', 'mainnet-beta');
    url.searchParams.append('tx_num', '3');
    url.searchParams.append('account', associatedTokenPubkey.toBase58());

    const { result } = await lastValueFrom(
      this._httpClient.get<{ result: any[] }>(url.toString(), {
        headers: {
          'x-api-key': shyftApiKey,
        },
      })
    );

    return result.map((transaction) => {
      if (
        transaction.type !== 'TOKEN_TRANSFER' ||
        transaction.actions.length !== 2
      ) {
        return {
          timestamp: new Date(transaction.timestamp),
          type: 'unknown',
        };
      }

      const memo = transaction.actions[1].info.message;
      const amount = transaction.actions[0].info.amount;
      const sign =
        transaction.actions[0].info.sender === publicKey.toBase58() ? -1 : 1;

      return {
        timestamp: new Date(transaction.timestamp),
        memo,
        amount,
        sign,
        type: 'transfer' as const,
      };
    });
  }
}

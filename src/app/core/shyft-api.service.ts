import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { PublicKey } from '@solana/web3.js';
import { map } from 'rxjs';
import {
  RawAccount,
  RawTransaction,
  config,
  createEndpointUrl,
  createTokenBalanceUrl,
  createTransactionHistoryUrl,
  toAccount,
  toTransaction,
} from '../utils';

@Injectable({ providedIn: 'root' })
export class ShyftApiService {
  private readonly _httpClient = inject(HttpClient);

  readonly shyftApiKey = signal(
    localStorage.getItem('shyftApiKey') ?? config.shyftApiKey,
  );
  readonly endpoint = computed(() => createEndpointUrl(this.shyftApiKey()));
  readonly syncLocalStorage = effect(() => {
    localStorage.setItem('shyftApiKey', this.shyftApiKey());
  });

  getAccount(publicKey: PublicKey) {
    const url = createTokenBalanceUrl({
      publicKey: publicKey.toBase58(),
      mint: config.mint,
    });
    const headers = {
      'x-api-key': this.shyftApiKey(),
    };

    return this._httpClient
      .get<{ result: RawAccount }>(url, { headers })
      .pipe(map(({ result }) => toAccount(result)));
  }

  getTransactions(publicKey: PublicKey) {
    const url = createTransactionHistoryUrl({
      account: publicKey.toBase58(),
      limit: 3,
    });
    const headers = {
      'x-api-key': this.shyftApiKey(),
    };

    return this._httpClient
      .get<{ result: RawTransaction[] }>(url, { headers })
      .pipe(map(({ result }) => result.map(toTransaction)));
  }

  setShyftApiKey(shyftApiKey: string) {
    this.shyftApiKey.set(shyftApiKey);
  }
}

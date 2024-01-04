import { Injectable, computed, effect, signal } from '@angular/core';
import { config } from '../utils';

@Injectable({ providedIn: 'root' })
export class ShyftApiKeyService {
  readonly shyftApiKey = signal(
    localStorage.getItem('shyftApiKey') ?? config.shyftApiKey,
  );
  readonly endpoint = computed(() => {
    const shyftApiKey = this.shyftApiKey();
    const url = new URL('https://rpc.shyft.to');

    url.searchParams.set('api_key', shyftApiKey);

    return url.toString();
  });
  readonly syncLocalStorage = effect(() => {
    localStorage.setItem('shyftApiKey', this.shyftApiKey());
  });

  setShyftApiKey(shyftApiKey: string) {
    this.shyftApiKey.set(shyftApiKey);
  }
}

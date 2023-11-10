import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { config } from '../utils';

@Injectable({ providedIn: 'root' })
export class ShyftApiKeyService {
  private readonly _shyftApiKey = new BehaviorSubject(
    localStorage.getItem('shyftApiKey') ?? config.shyftApiKey
  );

  readonly shyftApiKey$ = this._shyftApiKey.asObservable();

  setShyftApiKey(shyftApiKey: string) {
    this._shyftApiKey.next(shyftApiKey);
    localStorage.setItem('shyftApiKey', shyftApiKey);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { config } from '../utils';

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private readonly _rpcEndpoint = new BehaviorSubject(
    localStorage.getItem('rpcEndpoint') ?? config.rpcEndpoint
  );

  readonly rpcEndpoint$ = this._rpcEndpoint.asObservable();

  setRpcEndpoint(rpcEndpoint: string) {
    this._rpcEndpoint.next(rpcEndpoint);
    localStorage.setItem('rpcEndpoint', rpcEndpoint);
  }
}

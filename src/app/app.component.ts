import { Component, OnInit, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { RouterOutlet } from '@angular/router';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { HdWalletMultiButtonComponent } from '@heavy-duty/wallet-adapter-material';
import { config } from './config';

@Component({
  standalone: true,
  imports: [RouterOutlet, MatCardModule, HdWalletMultiButtonComponent],
  selector: 'my-bank-root',
  template: `
    <header class="mb-8 mt-16">
      <h1 class="text-5xl text-center mb-4">My Bank</h1>

      <div class="flex justify-center">
        <hd-wallet-multi-button></hd-wallet-multi-button>
      </div>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [],
})
export class AppComponent implements OnInit {
  private readonly _connectionStore = inject(ConnectionStore);

  ngOnInit() {
    this._connectionStore.setEndpoint(config.rpcEndpoint);
  }
}

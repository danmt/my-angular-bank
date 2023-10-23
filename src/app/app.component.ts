import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HdWalletMultiButtonComponent } from '@heavy-duty/wallet-adapter-material';

@Component({
  standalone: true,
  imports: [RouterModule, HdWalletMultiButtonComponent],
  selector: 'my-bank-root',
  template: `
    <header>
      <h1>My Bank</h1>

      <hd-wallet-multi-button></hd-wallet-multi-button>
    </header>

    <main></main>
  `,
  styles: [],
})
export class AppComponent {}

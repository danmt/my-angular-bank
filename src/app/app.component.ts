import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { HdWalletMultiButtonComponent } from '@heavy-duty/wallet-adapter-material';
import { ShyftApiKeyService } from './core';
import { UpdateSettingsService } from './settings';

@Component({
  standalone: true,
  imports: [
    RouterOutlet,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    HdWalletMultiButtonComponent,
  ],
  selector: 'my-bank-root',
  template: `
    <header class="pb-8 pt-16 relative">
      <h1 class="text-5xl text-center mb-4">My Bank</h1>

      <div class="absolute top-4 right-4">
        <button mat-fab (click)="onUpdateSettings()" color="accent">
          <mat-icon>settings</mat-icon>
        </button>
      </div>

      <div class="flex justify-center">
        <hd-wallet-multi-button></hd-wallet-multi-button>
      </div>
    </header>

    <main>
      <router-outlet></router-outlet>
    </main>
  `,
})
export class AppComponent implements OnInit {
  private readonly _connectionStore = inject(ConnectionStore);
  private readonly _shyftApiKeyService = inject(ShyftApiKeyService);
  private readonly _updateSettingsService = inject(UpdateSettingsService);

  ngOnInit() {
    this._connectionStore.setEndpoint(this._shyftApiKeyService.endpoint());
  }

  async onUpdateSettings() {
    const updateSettingsPayload =
      await this._updateSettingsService.updateSettings({
        shyftApiKey: this._shyftApiKeyService.shyftApiKey(),
      });

    if (updateSettingsPayload) {
      this._shyftApiKeyService.setShyftApiKey(
        updateSettingsPayload.shyftApiKey,
      );
    }
  }
}

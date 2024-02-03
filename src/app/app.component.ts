import { Component, OnInit, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { HdWalletMultiButtonComponent } from '@heavy-duty/wallet-adapter-material';
import { lastValueFrom } from 'rxjs';
import { ShyftApiService } from './core';
import {
  UpdateSettingsFormPayload,
  UpdateSettingsModalComponent,
  UpdateSettingsModalData,
} from './settings';

@Component({
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
  imports: [
    RouterOutlet,
    MatButton,
    MatCard,
    MatIcon,
    HdWalletMultiButtonComponent,
  ],
  standalone: true,
})
export class AppComponent implements OnInit {
  private readonly _connectionStore = inject(ConnectionStore);
  private readonly _shyftApiKeyService = inject(ShyftApiService);
  private readonly _matDialog = inject(MatDialog);

  ngOnInit() {
    this._connectionStore.setEndpoint(this._shyftApiKeyService.endpoint());
  }

  async onUpdateSettings() {
    const updateSettingsPayload = await lastValueFrom(
      this._matDialog
        .open<
          UpdateSettingsModalComponent,
          UpdateSettingsModalData,
          UpdateSettingsFormPayload
        >(UpdateSettingsModalComponent, {
          data: {
            shyftApiKey: this._shyftApiKeyService.shyftApiKey(),
          },
        })
        .afterClosed(),
    );

    if (updateSettingsPayload) {
      this._shyftApiKeyService.setShyftApiKey(
        updateSettingsPayload.shyftApiKey,
      );
    }
  }
}

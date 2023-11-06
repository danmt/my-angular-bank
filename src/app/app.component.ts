import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterOutlet } from '@angular/router';
import { ConnectionStore } from '@heavy-duty/wallet-adapter';
import { HdWalletMultiButtonComponent } from '@heavy-duty/wallet-adapter-material';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ConnectionService } from './connection.service';
import { UpdateSettingsFormPayload } from './update-settings-form.component';
import {
  UpdateSettingsModalComponent,
  UpdateSettingsModalData,
} from './update-settings-modal.component';

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
  styles: [],
})
export class AppComponent implements OnInit {
  private readonly _connectionStore = inject(ConnectionStore);
  private readonly _matDialog = inject(MatDialog);
  private readonly _connectionService = inject(ConnectionService);

  ngOnInit() {
    this._connectionStore.setEndpoint(this._connectionService.rpcEndpoint$);
  }

  async onUpdateSettings() {
    const rpcEndpoint = await firstValueFrom(
      this._connectionService.rpcEndpoint$
    );
    const updateSettingsPayload = await lastValueFrom(
      this._matDialog
        .open<
          UpdateSettingsModalComponent,
          UpdateSettingsModalData,
          UpdateSettingsFormPayload
        >(UpdateSettingsModalComponent, { data: { rpcEndpoint } })
        .afterClosed()
    );

    if (updateSettingsPayload) {
      this._connectionService.setRpcEndpoint(updateSettingsPayload.rpcEndpoint);
    }
  }
}

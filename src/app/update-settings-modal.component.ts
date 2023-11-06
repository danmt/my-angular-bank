import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  UpdateSettingsFormComponent,
  UpdateSettingsFormPayload,
} from './update-settings-form.component';

export interface UpdateSettingsModalData {
  rpcEndpoint: string;
  shyftApiKey: string;
}

@Component({
  selector: 'my-bank-update-settings-modal',
  template: `
    <header class="flex gap-4 items-center px-4 pt-4">
      <h2 class="grow">Update Settings</h2>
      <button (click)="onClose()" mat-icon-button>
        <mat-icon> close </mat-icon>
      </button>
    </header>

    <div class="p-4 min-w-[350px]">
      <my-bank-update-settings-form
        [model]="{
          rpcEndpoint: data.rpcEndpoint,
          shyftApiKey: data.shyftApiKey
        }"
        (updateSettings)="onUpdateSettings($event)"
      ></my-bank-update-settings-form>
    </div>
  `,
  standalone: true,
  imports: [MatButtonModule, MatIconModule, UpdateSettingsFormComponent],
  hostDirectives: [],
})
export class UpdateSettingsModalComponent {
  private readonly _matDialogRef = inject(
    MatDialogRef<UpdateSettingsModalComponent>
  );

  readonly data = inject<UpdateSettingsModalData>(MAT_DIALOG_DATA);

  async onUpdateSettings(payload: UpdateSettingsFormPayload) {
    this._matDialogRef.close(payload);
  }

  onClose() {
    this._matDialogRef.close(false);
  }
}

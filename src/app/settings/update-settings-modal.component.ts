import { Component, inject } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import {
  UpdateSettingsFormComponent,
  UpdateSettingsFormPayload,
} from './update-settings-form.component';

export interface UpdateSettingsModalData {
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
          shyftApiKey: data.shyftApiKey
        }"
        (updateSettings)="onUpdateSettings($event)"
      ></my-bank-update-settings-form>
    </div>

    <footer class="flex gap-2 justify-center items-center pb-4">
      <p>RPC and API Powered by</p>
      <a href="https://shyft.to" target="_blank">
        <img src="assets/shyft-logo.png" class="w-8 h-8" />
      </a>
    </footer>
  `,
  imports: [MatButton, MatIcon, UpdateSettingsFormComponent],
  standalone: true,
})
export class UpdateSettingsModalComponent {
  private readonly _matDialogRef = inject(
    MatDialogRef<UpdateSettingsModalComponent>,
  );

  readonly data = inject<UpdateSettingsModalData>(MAT_DIALOG_DATA);

  async onUpdateSettings(payload: UpdateSettingsFormPayload) {
    this._matDialogRef.close(payload);
  }

  onClose() {
    this._matDialogRef.close(false);
  }
}

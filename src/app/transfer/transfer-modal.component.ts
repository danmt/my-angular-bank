import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  TransferFormComponent,
  TransferFormPayload,
} from './transfer-form.component';

@Component({
  selector: 'my-bank-transfer-modal',
  template: `
    <header class="flex gap-4 items-center px-4 pt-4">
      <h2 class="grow">Send Funds</h2>
      <button (click)="onClose()" mat-icon-button>
        <mat-icon> close </mat-icon>
      </button>
    </header>

    <div class="p-4 min-w-[350px]">
      <my-bank-transfer-form
        (transfer)="onTransfer($event)"
      ></my-bank-transfer-form>
    </div>
  `,
  imports: [MatButtonModule, MatIconModule, TransferFormComponent],
  standalone: true,
})
export class TransferModalComponent {
  private readonly _matDialogRef = inject(MatDialogRef<TransferModalComponent>);

  onTransfer(payload: TransferFormPayload) {
    this._matDialogRef.close(payload);
  }

  onClose() {
    this._matDialogRef.close(false);
  }
}

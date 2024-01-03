import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fromUserValue } from '../utils';

export interface TransferFormModel {
  receiver: string | null;
  amount: number | null;
  memo: string | null;
}

export interface TransferFormPayload {
  receiver: string;
  amount: number;
  memo: string;
}

@Component({
  selector: 'my-bank-transfer-form',
  template: `
    <form #form="ngForm" (ngSubmit)="onSubmit(form)">
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Receiver</mat-label>
        <input
          matInput
          name="receiver"
          [(ngModel)]="model.receiver"
          #receiverControl="ngModel"
          required
        />
        @if (form.submitted && receiverControl.errors?.['required']) {
        <mat-error> Receiver is required. </mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Memo</mat-label>
        <input
          matInput
          name="memo"
          [(ngModel)]="model.memo"
          #memoControl="ngModel"
          required
        />
        @if (form.submitted && memoControl.errors?.['required']) {
        <mat-error> Memo is required. </mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="fill" class="w-full mb-4">
        <mat-label>Amount</mat-label>
        <input
          matInput
          name="amount"
          type="number"
          [(ngModel)]="model.amount"
          #amountControl="ngModel"
          required
          min="0.01"
        />
        @if (form.submitted && amountControl.errors?.['required']) {
        <mat-error> Amount is required. </mat-error>
        } @else if (form.submitted && amountControl.errors?.['min']) {
        <mat-error> Amount should be one cent or more. </mat-error>
        }
      </mat-form-field>

      <div>
        <button
          type="submit"
          [disabled]="disabled"
          mat-raised-button
          color="primary"
        >
          Send
        </button>
      </div>
    </form>
  `,
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class TransferFormComponent {
  private readonly _matSnackBar = inject(MatSnackBar);

  @Input() model: TransferFormModel = {
    receiver: null,
    amount: null,
    memo: null,
  };
  @Input() disabled = false;
  @Output() transfer = new EventEmitter<TransferFormPayload>();

  onSubmit(form: NgForm) {
    if (
      form.invalid ||
      this.model.amount === null ||
      this.model.receiver === null ||
      this.model.memo === null
    ) {
      this._matSnackBar.open('Invalid data, review form entries.', 'close', {
        duration: 3000,
      });
    } else {
      this.transfer.emit({
        amount: fromUserValue(this.model.amount),
        receiver: this.model.receiver,
        memo: this.model.memo,
      });
    }
  }
}

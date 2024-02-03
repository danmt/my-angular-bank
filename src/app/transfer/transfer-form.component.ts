import { Component, EventEmitter, Output, inject, input } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
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
          [(ngModel)]="model().receiver"
          #receiverControl="ngModel"
          required
        />
        @if (form.submitted && receiverControl.errors) {
          <mat-error>
            @if (receiverControl.errors['required']) {
              Receiver is required.
            }
          </mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Memo</mat-label>
        <input
          matInput
          name="memo"
          [(ngModel)]="model().memo"
          #memoControl="ngModel"
          required
        />
        @if (form.submitted && memoControl.errors) {
          <mat-error>
            @if (memoControl.errors['required']) {
              Memo is required.
            }
          </mat-error>
        }
      </mat-form-field>

      <mat-form-field appearance="fill" class="w-full mb-4">
        <mat-label>Amount</mat-label>
        <input
          matInput
          name="amount"
          type="number"
          [(ngModel)]="model().amount"
          #amountControl="ngModel"
          required
          min="0.01"
        />
        @if (form.submitted && amountControl.errors) {
          <mat-error>
            @if (amountControl.errors['required']) {
              Amount is required.
            } @else if (amountControl.errors['required']) {
              Amount should be one cent or more.
            }
          </mat-error>
        }
      </mat-form-field>

      <footer>
        <button
          type="submit"
          [disabled]="disabled()"
          mat-raised-button
          color="primary"
        >
          Send
        </button>
      </footer>
    </form>
  `,
  imports: [FormsModule, MatFormField, MatInput, MatLabel, MatError, MatButton],
  standalone: true,
})
export class TransferFormComponent {
  private readonly _matSnackBar = inject(MatSnackBar);

  readonly model = input<TransferFormModel>({
    receiver: null,
    amount: null,
    memo: null,
  });
  readonly disabled = input(false);
  @Output() readonly transfer = new EventEmitter<TransferFormPayload>();

  onSubmit(form: NgForm) {
    const model = this.model();

    if (
      form.invalid ||
      model.amount === null ||
      model.receiver === null ||
      model.memo === null
    ) {
      this._matSnackBar.open('Invalid data, review form entries.', 'close', {
        duration: 3000,
      });
    } else {
      this.transfer.emit({
        amount: fromUserValue(model.amount),
        receiver: model.receiver,
        memo: model.memo,
      });
    }
  }
}

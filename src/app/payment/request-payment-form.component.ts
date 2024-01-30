import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
  input,
} from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { fromUserValue } from '../utils';

export interface RequestPaymentFormModel {
  amount: number | null;
  memo: string | null;
}

export interface RequestPaymentFormPayload {
  amount: number;
  memo: string;
}

@Component({
  selector: 'my-bank-request-payment-form',
  template: `
    <form #form="ngForm" (ngSubmit)="onSubmit(form)">
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Memo</mat-label>
        <input
          matInput
          name="memo"
          [(ngModel)]="model().memo"
          #memoControl="ngModel"
          required
        />
        @if (form.submitted && amountControl.errors) {
          <mat-error>
            @if (amountControl.errors['required']) {
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
          Generate Payment Request
        </button>
      </footer>
    </form>
  `,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class RequestPaymentFormComponent {
  private readonly _matSnackBar = inject(MatSnackBar);

  model = input<RequestPaymentFormModel>({
    amount: null,
    memo: null,
  });
  disabled = input(false);
  @Output() requestPayment = new EventEmitter<RequestPaymentFormPayload>();

  onSubmit(form: NgForm) {
    const model = this.model();

    if (form.invalid || model.amount === null || model.memo === null) {
      this._matSnackBar.open('Invalid data, review form entries.', 'close', {
        duration: 3000,
      });
    } else {
      this.requestPayment.emit({
        amount: fromUserValue(model.amount),
        memo: model.memo,
      });
    }
  }
}

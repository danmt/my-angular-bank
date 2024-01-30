import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  RequestPaymentFormComponent,
  RequestPaymentFormPayload,
} from './request-payment-form.component';

@Component({
  selector: 'my-bank-request-payment-modal',
  template: `
    <header class="flex gap-4 items-center px-4 pt-4">
      <h2 class="grow">Requesting a payment</h2>
      <button (click)="onClose()" mat-icon-button>
        <mat-icon> close </mat-icon>
      </button>
    </header>

    <div class="p-4 min-w-[350px]">
      <my-bank-request-payment-form
        (requestPayment)="onRequestPayment($event)"
      ></my-bank-request-payment-form>
    </div>
  `,
  imports: [MatButtonModule, MatIconModule, RequestPaymentFormComponent],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class RequestPaymentModalComponent {
  private readonly _matDialogRef = inject(
    MatDialogRef<RequestPaymentModalComponent>,
  );

  onRequestPayment(payload: RequestPaymentFormPayload) {
    this._matDialogRef.close(payload);
  }

  onClose() {
    this._matDialogRef.close();
  }
}

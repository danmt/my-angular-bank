import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PublicKey } from '@solana/web3.js';
import {
  config,
  createPaymentRequestUrl,
  createSolanaPayUrl,
  toUserValue,
} from '../utils';
import { PaymentRequestSectionComponent } from './payment-request-section.component';

export interface PaymentRequestModalData {
  requester: PublicKey;
  amount: number;
  memo: string;
}

@Component({
  selector: 'my-bank-payment-request-modal',
  template: `
    <header class="flex gap-4 items-center px-4 pt-4">
      <h2 class="grow">Payment Request</h2>
      <button (click)="onClose()" mat-icon-button>
        <mat-icon> close </mat-icon>
      </button>
    </header>

    <div class="p-4 min-w-[350px] max-w-[450px]">
      <my-bank-payment-request-section
        [url]="url"
        [solanaPayUrl]="solanaPayUrl"
      ></my-bank-payment-request-section>
    </div>
  `,
  imports: [MatButtonModule, MatIconModule, PaymentRequestSectionComponent],
  standalone: true,
})
export class PaymentRequestModalComponent {
  private readonly _matDialogRef = inject(
    MatDialogRef<PaymentRequestModalComponent>,
  );
  readonly data = inject<PaymentRequestModalData>(MAT_DIALOG_DATA);
  readonly url = createPaymentRequestUrl({
    amount: this.data.amount,
    memo: this.data.memo,
    requester: this.data.requester.toBase58(),
  });
  readonly solanaPayUrl = createSolanaPayUrl({
    receiver: this.data.requester.toBase58(),
    mint: config.mint,
    amount: toUserValue(this.data.amount),
    memo: this.data.memo,
  });

  onClose() {
    this._matDialogRef.close();
  }
}

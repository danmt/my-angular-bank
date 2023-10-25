import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PushPipe } from '@ngrx/component';
import { PublicKey } from '@solana/web3.js';

export interface PaymentRequestModalData {
  requesterPublicKey: PublicKey;
  amount: number;
  memo: string;
}

@Component({
  selector: 'my-bank-payment-request-modal',
  template: `
    <div>
      <header class="flex gap-4 items-center px-4 pt-4">
        <h2 class="grow">Payment Request</h2>
        <button (click)="onClose()" mat-icon-button>
          <mat-icon> close </mat-icon>
        </button>
      </header>

      <div class="p-4 min-w-[350px] max-w-[450px]">
        <p class="mb-4">Share this link for paying the request:</p>

        <div
          class="rounded-md px-4 py-2 flex items-center gap-4 bg-black bg-opacity-10"
        >
          <p class="truncate flex-grow">{{ url }}</p>

          <button mat-icon-button [cdkCopyToClipboard]="url">
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [NgIf, MatButtonModule, MatIconModule, PushPipe, ClipboardModule],
  hostDirectives: [],
})
export class PaymentRequestModalComponent implements OnInit {
  private readonly _matDialogRef = inject(
    MatDialogRef<PaymentRequestModalComponent>
  );
  readonly data = inject<PaymentRequestModalData>(MAT_DIALOG_DATA);

  url: string = '';

  ngOnInit() {
    const url = new URL('http://localhost:4200/pay');

    url.searchParams.append('amount', this.data.amount.toString());
    url.searchParams.append('memo', this.data.memo);
    url.searchParams.append(
      'requester',
      this.data.requesterPublicKey.toBase58()
    );

    this.url = url.toString();
  }

  onClose() {
    this._matDialogRef.close();
  }
}

import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { LetDirective } from '@ngrx/component';
import { PublicKey } from '@solana/web3.js';
import { QRCodeModule } from 'angularx-qrcode';
import { toUserValue } from './to-user-value';

export interface PaymentRequestModalData {
  requester: PublicKey;
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
          class="rounded-md px-4 py-2 flex items-center gap-4 bg-black bg-opacity-10 mb-4"
        >
          <p class="truncate flex-grow">{{ url }}</p>

          <button mat-icon-button [cdkCopyToClipboard]="url">
            <mat-icon>content_copy</mat-icon>
          </button>
        </div>

        <p class="mb-4">or</p>

        <p class="mb-4">Use Solana Pay</p>

        <div class="flex justify-center">
          <qrcode
            *ngIf="solanaPayUrl !== null; else solanaPayUrlNotDefined"
            [qrdata]="solanaPayUrl"
            [width]="256"
            [margin]="0"
            [errorCorrectionLevel]="'M'"
          ></qrcode>

          <ng-template #solanaPayUrlNotDefined>
            <div
              class="w-[256px] h-[256px] bg-black bg-opacity-10 p-4 flex justify-center items-center"
            >
              <p class="text-center italic text-sm">URL is not defined</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatIconModule,
    ClipboardModule,
    LetDirective,
    QRCodeModule,
  ],
  hostDirectives: [],
})
export class PaymentRequestModalComponent implements OnInit {
  private readonly _matDialogRef = inject(
    MatDialogRef<PaymentRequestModalComponent>
  );
  readonly data = inject<PaymentRequestModalData>(MAT_DIALOG_DATA);

  url: string = '';
  solanaPayUrl: string = '';

  ngOnInit() {
    const url = new URL('http://localhost:4200/pay');

    url.searchParams.append('amount', this.data.amount.toString());
    url.searchParams.append('memo', this.data.memo);
    url.searchParams.append('requester', this.data.requester.toBase58());

    this.url = url.toString();

    const solanaPayUrl = new URL(`solana:${this.data.requester.toBase58()}`);

    solanaPayUrl.searchParams.append(
      'spl-token',
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
    );
    solanaPayUrl.searchParams.append(
      'amount',
      toUserValue(this.data.amount, 6).toString()
    );
    solanaPayUrl.searchParams.append('memo', this.data.memo);

    this.solanaPayUrl = solanaPayUrl.toString();
  }

  onClose() {
    this._matDialogRef.close();
  }
}

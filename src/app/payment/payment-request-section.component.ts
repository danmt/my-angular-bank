import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { Component, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { LetDirective } from '@ngrx/component';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'my-bank-payment-request-section',
  template: `
    <p class="mb-4">Share this link for paying the request:</p>

    <div
      class="rounded-md px-4 py-2 flex items-center gap-4 bg-black bg-opacity-10 mb-4"
      *ngrxLet="url() as url"
    >
      @if (url !== null) {
        <p class="truncate flex-grow">{{ url }}</p>

        <button mat-icon-button [cdkCopyToClipboard]="url">
          <mat-icon>content_copy</mat-icon>
        </button>
      } @else {
        -
      }
    </div>

    <p class="mb-4">or</p>

    <p class="mb-4">Use Solana Pay</p>

    <div class="flex justify-center" *ngrxLet="solanaPayUrl() as solanaPayUrl">
      @if (solanaPayUrl !== null) {
        <qrcode
          [qrdata]="solanaPayUrl"
          [width]="256"
          [margin]="0"
          [errorCorrectionLevel]="'M'"
        ></qrcode>
      } @else {
        <div
          class="w-[256px] h-[256px] bg-black bg-opacity-10 p-4 flex justify-center items-center"
        >
          <p class="text-center italic text-sm">URL is not defined</p>
        </div>
      }
    </div>
  `,
  imports: [MatButton, MatIcon, CdkCopyToClipboard, LetDirective, QRCodeModule],
  standalone: true,
})
export class PaymentRequestSectionComponent {
  readonly url = input.required<string | null>();
  readonly solanaPayUrl = input.required<string | null>();
}

import { Component, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { LetDirective } from '@ngrx/component';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  selector: 'my-bank-pay-qr-section',
  template: `
    <mat-card class="px-4 py-8 w-[400px] h-full">
      <header class="mb-4">
        <h2 class="text-3xl text-center">Pay using Solana Pay</h2>
      </header>

      <div
        class="flex justify-center"
        *ngrxLet="solanaPayUrl() as solanaPayUrl"
      >
        @if (solanaPayUrl !== null) {
          <qrcode
            [qrdata]="solanaPayUrl"
            [width]="256"
            [margin]="0"
            [errorCorrectionLevel]="'M'"
          ></qrcode>
        }
      </div>
    </mat-card>
  `,
  imports: [MatCardModule, LetDirective, QRCodeModule],
  standalone: true,
})
export class PayQrSectionComponent {
  readonly solanaPayUrl = input.required<string | null>();
}

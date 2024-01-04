import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  standalone: true,
  imports: [MatCardModule, QRCodeModule],
  selector: 'my-bank-pay-qr-section',
  template: `
    <mat-card class="px-4 py-8 w-[400px]">
      <header class="mb-4">
        <h2 class="text-3xl text-center">Pay using Solana Pay</h2>
      </header>

      <div class="flex justify-center">
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
})
export class PayQrSectionComponent {
  @Input({ required: true }) solanaPayUrl: string | null = null;
}

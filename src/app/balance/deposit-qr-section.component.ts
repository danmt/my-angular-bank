import { Component, HostBinding, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { QRCodeModule } from 'angularx-qrcode';

@Component({
  standalone: true,
  imports: [MatCardModule, QRCodeModule],
  selector: 'my-bank-deposit-qr-section',
  template: `
    <mat-card class="px-4 py-8 w-[400px] h-full">
      <header class="mb-4">
        <h2 class="text-3xl text-center">Deposit using Solana Pay</h2>
      </header>

      <div class="flex justify-center">
        @if (solanaPayDepositUrl !== null) {
          <qrcode
            [qrdata]="solanaPayDepositUrl"
            [width]="256"
            [margin]="0"
            [errorCorrectionLevel]="'M'"
          ></qrcode>
        } @else {
          <div
            class="w-[256px] h-[256px] bg-black bg-opacity-10 p-4 flex justify-center items-center"
          >
            <p class="text-center italic text-sm">
              Connect wallet to view QR Code
            </p>
          </div>
        }
      </div>
    </mat-card>
  `,
})
export class DepositQrSectionComponent {
  @HostBinding() class = 'block';
  @Input({ required: true }) solanaPayDepositUrl: string | null = null;
}

import { ClipboardModule } from '@angular/cdk/clipboard';
import { DecimalPipe, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { HdObscureAddressPipe } from '@heavy-duty/wallet-adapter-cdk';
import { HdWalletMultiButtonComponent } from '@heavy-duty/wallet-adapter-material';
import { PublicKey } from '@solana/web3.js';
import { QRCodeModule } from 'angularx-qrcode';
import { ToUserValuePipe } from '../shared';
import { ProcessTransferService } from '../transfer';
import { config, toUserValue } from '../utils';

@Component({
  standalone: true,
  imports: [
    NgIf,
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ClipboardModule,
    QRCodeModule,
    HdWalletMultiButtonComponent,
    HdObscureAddressPipe,
    ToUserValuePipe,
  ],
  selector: 'my-bank-payment-page',
  template: `
    <div class="flex gap-4 justify-center">
      <mat-card class="px-4 py-8 w-[500px]">
        <header class="mb-4">
          <h2 class="text-3xl text-center mb-4">Payment Details</h2>
        </header>

        <div *ngIf="amount !== null && memo !== null && requester !== null">
          <p class="font-bold text-lg">Details</p>
          <p class="pl-4 mb-4">
            {{ memo }}
          </p>
          <p class="font-bold text-lg">Requested by</p>
          <p class="pl-4 flex items-center gap-4 mb-4">
            {{ requester.toBase58() | hdObscureAddress }}
            <button
              mat-icon-button
              [cdkCopyToClipboard]="requester.toBase58()"
              class="-scale-[0.85]"
            >
              <mat-icon>content_copy</mat-icon>
            </button>
          </p>

          <hr class="mb-4" />

          <div class="flex justify-center items-center gap-2 mb-4">
            <img src="assets/usdc-logo.png" class="w-12 h-12" />

            <p class="text-4xl">
              {{ amount | hdToUserValue | number : '2.2-2' }}
            </p>
          </div>

          <div class="flex justify-center">
            <button
              mat-raised-button
              color="primary"
              (click)="onApprovePayment()"
            >
              Approve Payment
            </button>
          </div>
        </div>
      </mat-card>

      <mat-card class="px-4 py-8 w-[400px]">
        <header class="mb-4">
          <h2 class="text-3xl text-center">Pay using Solana Pay</h2>
        </header>

        <div class="flex justify-center">
          <qrcode
            *ngIf="solanaPayUrl !== null"
            [qrdata]="solanaPayUrl"
            [width]="256"
            [margin]="0"
            [errorCorrectionLevel]="'M'"
          ></qrcode>
        </div>
      </mat-card>
    </div>
  `,
  styles: [],
})
export class PaymentPageComponent implements OnInit {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _processTransferService = inject(ProcessTransferService);

  amount!: number;
  memo!: string;
  requester!: PublicKey;
  solanaPayUrl!: string;

  ngOnInit() {
    const amount = this._activatedRoute.snapshot.queryParamMap.get('amount');
    const memo = this._activatedRoute.snapshot.queryParamMap.get('memo');
    const requester =
      this._activatedRoute.snapshot.queryParamMap.get('requester');

    if (!amount || !memo || !requester) {
      throw new Error('Invalid request payment link.');
    }

    this.amount = Number(amount);
    this.memo = memo;
    this.requester = new PublicKey(requester);

    const solanaPayUrl = new URL(`solana:${requester}`);

    solanaPayUrl.searchParams.append('spl-token', config.mint);
    solanaPayUrl.searchParams.append(
      'amount',
      toUserValue(this.amount).toString()
    );
    solanaPayUrl.searchParams.append('memo', this.memo);

    this.solanaPayUrl = solanaPayUrl.toString();
  }

  async onApprovePayment() {
    try {
      await this._processTransferService.processTransfer({
        receiver: this.requester,
        amount: this.amount,
        memo: this.memo,
      });
    } catch (error) {
      console.error('An error occured while transfering.', error);
    }
  }
}

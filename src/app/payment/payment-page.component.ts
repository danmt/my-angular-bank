import { ClipboardModule } from '@angular/cdk/clipboard';
import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute } from '@angular/router';
import { HdObscureAddressPipe } from '@heavy-duty/wallet-adapter-cdk';
import { HdWalletMultiButtonComponent } from '@heavy-duty/wallet-adapter-material';
import { PublicKey } from '@solana/web3.js';
import { QRCodeModule } from 'angularx-qrcode';
import { lastValueFrom } from 'rxjs';
import { WalletService } from '../core';
import { ToUserValuePipe } from '../shared';
import {
  ProcessTransferModalComponent,
  ProcessTransferModalData,
} from '../transfer';
import { config, createSolanaPayUrl, toUserValue } from '../utils';

@Component({
  standalone: true,
  imports: [
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

        @if (amount !== null && memo !== null && requester !== null) {
          <div>
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
                {{ amount | hdToUserValue | number: '2.2-2' }}
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
        }
      </mat-card>

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
    </div>
  `,
  styles: [],
})
export class PaymentPageComponent implements OnInit {
  private readonly _matDialog = inject(MatDialog);
  private readonly _walletService = inject(WalletService);
  private readonly _activatedRoute = inject(ActivatedRoute);

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
    this.solanaPayUrl = createSolanaPayUrl({
      receiver: requester,
      mint: config.mint,
      amount: toUserValue(this.amount),
      memo: this.memo,
    });
  }

  async onApprovePayment() {
    try {
      const sender = await this._walletService.getOrConnectWallet();

      await lastValueFrom(
        this._matDialog
          .open<
            ProcessTransferModalComponent,
            ProcessTransferModalData,
            string
          >(ProcessTransferModalComponent, {
            data: {
              sender,
              amount: this.amount,
              receiver: this.requester,
              memo: this.memo,
            },
          })
          .afterClosed(),
      );
    } catch (error) {
      console.error('An error occured while transfering.', error);
    }
  }
}

import { ClipboardModule } from '@angular/cdk/clipboard';
import { DecimalPipe, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import {
  ConnectionStore,
  Wallet,
  WalletStore,
} from '@heavy-duty/wallet-adapter';
import { HdObscureAddressPipe } from '@heavy-duty/wallet-adapter-cdk';
import {
  HdWalletModalComponent,
  HdWalletMultiButtonComponent,
} from '@heavy-duty/wallet-adapter-material';
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { WalletName } from '@solana/wallet-adapter-base';
import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { ToUserValuePipe } from './to-user-value.pipe';

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
    HdWalletMultiButtonComponent,
    HdObscureAddressPipe,
    ToUserValuePipe,
  ],
  selector: 'my-bank-pay-page',
  template: `
    <mat-card class="mx-auto my-8 px-4 py-8 w-full max-w-[500px]">
      <header class="mb-4">
        <h2 class="text-3xl text-center mb-4">Approve Payment</h2>
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
            {{ amount | hdToUserValue : 6 | number : '2.2-2' }}
          </p>
        </div>

        <div class="flex justify-center">
          <button
            mat-raised-button
            color="primary"
            [disabled]="isRunning"
            (click)="onApprovePayment()"
          >
            Approve Payment

            <span
              *ngIf="isRunning"
              class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            >
              <mat-progress-spinner
                diameter="16"
                color="primary"
                mode="indeterminate"
              ></mat-progress-spinner>
            </span>
          </button>
        </div>
      </div>
    </mat-card>
  `,
  styles: [],
})
export class PayPageComponent implements OnInit {
  private readonly _activatedRoute = inject(ActivatedRoute);
  private readonly _walletStore = inject(WalletStore);
  private readonly _connectionStore = inject(ConnectionStore);
  private readonly _matSnackBar = inject(MatSnackBar);
  private readonly _matDialog = inject(MatDialog);

  amount: number | null = null;
  memo: string | null = null;
  requester: PublicKey | null = null;
  isRunning = false;

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
  }

  async onApprovePayment() {
    const amount = this.amount;
    const memo = this.memo;
    const requester = this.requester;
    this.isRunning = true;

    try {
      if (amount === null || memo === null || requester === null) {
        throw new Error('Invalid request payment link.');
      }

      let payerWalletPubkey = await firstValueFrom(
        this._walletStore.publicKey$
      );

      if (!payerWalletPubkey) {
        const wallets = await firstValueFrom(this._walletStore.wallets$);
        const walletName = await lastValueFrom(
          this._matDialog
            .open<HdWalletModalComponent, { wallets: Wallet[] }, WalletName>(
              HdWalletModalComponent,
              {
                panelClass: ['wallet-modal'],
                maxWidth: '380px',
                maxHeight: '90vh',
                data: {
                  wallets,
                },
              }
            )
            .afterClosed()
        );

        if (!walletName) {
          return;
        }

        this._walletStore.selectWallet(walletName);
        await firstValueFrom(this._walletStore.connect());

        payerWalletPubkey = await firstValueFrom(this._walletStore.publicKey$);

        if (!payerWalletPubkey) {
          throw new Error('Wallet not connected');
        }
      }

      const payerAssociatedTokenPubkey = getAssociatedTokenAddressSync(
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        payerWalletPubkey
      );
      const requesterAssociatedTokenPubkey = getAssociatedTokenAddressSync(
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        requester
      );

      const connection = await firstValueFrom(
        this._connectionStore.connection$
      );

      if (!connection) {
        throw new Error('Connection is missing');
      }

      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      const transferTransactionInstruction = [
        createTransferInstruction(
          payerAssociatedTokenPubkey,
          requesterAssociatedTokenPubkey,
          payerWalletPubkey,
          amount
        ),
        new TransactionInstruction({
          keys: [
            { pubkey: payerWalletPubkey, isSigner: true, isWritable: true },
          ],
          data: Buffer.from(memo, 'utf-8'),
          programId: new PublicKey(
            'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
          ),
        }),
      ];
      const transferTransactionMessage = new TransactionMessage({
        payerKey: payerWalletPubkey,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: transferTransactionInstruction,
      }).compileToV0Message();
      const transferTransaction = new VersionedTransaction(
        transferTransactionMessage
      );
      const transferTransactionSignature = await firstValueFrom(
        this._walletStore.sendTransaction(transferTransaction, connection, {
          maxRetries: 5,
        })
      );
      const transferTransactionConfirmation =
        await connection.confirmTransaction({
          signature: transferTransactionSignature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

      if (transferTransactionConfirmation.value.err) {
        throw new Error(transferTransactionConfirmation.value.err.toString());
      }

      console.log(
        '🎉 Transaction Succesfully Confirmed!',
        '\n',
        `https://explorer.solana.com/tx/${transferTransactionSignature}`
      );

      this._matSnackBar.open('Funds successfully sent.', 'close', {
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      this._matSnackBar.open(
        'An error occurred trying to send funds.',
        'close',
        {
          duration: 3000,
        }
      );
    } finally {
      this.isRunning = false;
    }
  }
}

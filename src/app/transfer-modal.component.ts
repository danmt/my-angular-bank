import { NgIf } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { PushPipe } from '@ngrx/component';
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js';
import { firstValueFrom } from 'rxjs';
import {
  TransferFormComponent,
  TransferFormPayload,
} from './transfer-form.component';

@Component({
  selector: 'my-bank-transfer-modal',
  template: `
    <div>
      <header class="flex gap-4 items-center px-4 pt-4">
        <h2 class="grow">Send Funds</h2>
        <button (click)="onClose()" mat-icon-button>
          <mat-icon> close </mat-icon>
        </button>
      </header>

      <div class="p-4 min-w-[350px]">
        <my-bank-transfer-form
          (transfer)="onTransfer($event)"
        ></my-bank-transfer-form>
      </div>

      <div
        *ngIf="isRunning"
        class="absolute w-full h-full z-20 top-0 left-0 bg-white bg-opacity-80 flex justify-center items-center flex-col gap-4"
      >
        <mat-progress-spinner
          mode="indeterminate"
          diameter="64"
        ></mat-progress-spinner>
        <span> Processing transfer... </span>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    NgIf,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PushPipe,
    TransferFormComponent,
  ],
  hostDirectives: [],
})
export class TransferModalComponent {
  private readonly _matDialogRef = inject(MatDialogRef<TransferModalComponent>);
  private readonly _walletStore = inject(WalletStore);
  private readonly _connectionStore = inject(ConnectionStore);
  private readonly _matSnackBar = inject(MatSnackBar);

  isRunning = false;

  async onTransfer(payload: TransferFormPayload) {
    this.isRunning = true;
    this._matDialogRef.disableClose = true;

    try {
      // get current user ata
      const senderWalletPubkey = await firstValueFrom(
        this._walletStore.publicKey$
      );

      if (!senderWalletPubkey) {
        throw new Error('Wallet not connected');
      }

      const senderAssociatedTokenPubkey = getAssociatedTokenAddressSync(
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        senderWalletPubkey
      );

      // get receiver ata
      const receiverWalletPubkey = new PublicKey(payload.receiver);
      const receiverAssociatedTokenPubkey = getAssociatedTokenAddressSync(
        new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
        receiverWalletPubkey
      );

      // create, send and confirm transaction
      const connection = await firstValueFrom(
        this._connectionStore.connection$
      );

      if (!connection) {
        throw new Error('Connection is missing');
      }

      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      const transferTransactionInstruction = [
        createTransferInstruction(
          senderAssociatedTokenPubkey,
          receiverAssociatedTokenPubkey,
          senderWalletPubkey,
          payload.amount
        ),
        new TransactionInstruction({
          keys: [
            { pubkey: senderWalletPubkey, isSigner: true, isWritable: true },
          ],
          data: Buffer.from(payload.memo, 'utf-8'),
          programId: new PublicKey(
            'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
          ),
        }),
      ];
      const transferTransactionMessage = new TransactionMessage({
        payerKey: senderWalletPubkey,
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
      this._matDialogRef.close(true);
    } catch (error) {
      console.error(error);
      this._matSnackBar.open(
        'An error occurred trying to transfer funds.',
        'close',
        {
          duration: 3000,
        }
      );
    } finally {
      this.isRunning = false;
      this._matDialogRef.disableClose = false;
    }
  }

  onClose() {
    this._matDialogRef.close(false);
  }
}

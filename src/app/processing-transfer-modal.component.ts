import { NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
  TransactionSignature,
  VersionedTransaction,
} from '@solana/web3.js';
import { firstValueFrom } from 'rxjs';
import { config } from './config';
import { TransferFormComponent } from './transfer-form.component';

export interface ProcessingTransferModalData {
  sender: PublicKey;
  receiver: PublicKey;
  amount: number;
  memo: string;
}

export type ProcessingTransferModalStatus =
  | 'pending'
  | 'sending'
  | 'confirming'
  | 'confirmed'
  | 'failed';

@Component({
  selector: 'my-bank-processing-transfer-modal',
  template: `
    <div>
      <header class="flex gap-4 items-center px-4 pt-4">
        <h2 class="grow">
          <ng-container [ngSwitch]="status">
            <ng-container *ngSwitchCase="'pending'">
              Pending Transfer
            </ng-container>
            <ng-container *ngSwitchCase="'sending'">
              Sending Transfer
            </ng-container>
            <ng-container *ngSwitchCase="'confirming'">
              Confirming Transfer
            </ng-container>
            <ng-container *ngSwitchCase="'failed'">
              Failed Transfer
            </ng-container>
            <ng-container *ngSwitchCase="'confirmed'">
              Successful Transfer
            </ng-container>
          </ng-container>
        </h2>
        <button (click)="onClose()" mat-icon-button [disabled]="isRunning">
          <mat-icon> close </mat-icon>
        </button>
      </header>

      <div class="p-4 min-w-[350px] max-w-[450px]">
        <div
          *ngIf="status !== 'confirmed' && status !== 'failed'"
          class="flex flex-col gap-4 items-center"
        >
          <mat-progress-spinner
            mode="indeterminate"
            diameter="64"
          ></mat-progress-spinner>

          <p class="text-sm italic text-center">
            Processing... Do NOT reload the page.
          </p>
        </div>

        <div *ngIf="status === 'confirmed'">
          <p class="mb-2">
            Feel free to inspect the transaction on the Solana Explorer:
          </p>

          <p>
            <a
              [href]="'https://explorer.solana.com/tx/' + transactionSignature"
              target="_blank"
              class="underline text-blue-400"
            >
              [view in explorer]
            </a>
          </p>
        </div>

        <div *ngIf="status === 'failed'">
          <p class="px-4 py-1 bg-red-200 text-red-600">
            {{ error }}
          </p>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    NgIf,
    NgSwitch,
    NgSwitchCase,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    PushPipe,
    TransferFormComponent,
  ],
  hostDirectives: [],
})
export class ProcessingTransferModalComponent implements OnInit {
  private readonly _matDialogRef = inject(
    MatDialogRef<ProcessingTransferModalComponent>
  );
  private readonly _walletStore = inject(WalletStore);
  private readonly _connectionStore = inject(ConnectionStore);
  private readonly _matSnackBar = inject(MatSnackBar);

  readonly data = inject<ProcessingTransferModalData>(MAT_DIALOG_DATA);

  isRunning = false;
  status: ProcessingTransferModalStatus = 'pending';
  transactionSignature: TransactionSignature | null = null;
  error: string | null = null;

  async ngOnInit() {
    this.isRunning = true;
    this._matDialogRef.disableClose = true;

    try {
      // get atas
      const senderAssociatedTokenPubkey = getAssociatedTokenAddressSync(
        new PublicKey(config.mint),
        this.data.sender
      );

      const receiverAssociatedTokenPubkey = getAssociatedTokenAddressSync(
        new PublicKey(config.mint),
        this.data.receiver
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
          this.data.sender,
          this.data.amount
        ),
        new TransactionInstruction({
          keys: [
            { pubkey: this.data.sender, isSigner: true, isWritable: true },
          ],
          data: Buffer.from(this.data.memo, 'utf-8'),
          programId: new PublicKey(config.memoProgramId),
        }),
      ];
      const transferTransactionMessage = new TransactionMessage({
        payerKey: this.data.sender,
        recentBlockhash: latestBlockhash.blockhash,
        instructions: transferTransactionInstruction,
      }).compileToV0Message();
      const transferTransaction = new VersionedTransaction(
        transferTransactionMessage
      );
      this.status = 'sending';
      this.transactionSignature = await firstValueFrom(
        this._walletStore.sendTransaction(transferTransaction, connection, {
          maxRetries: 5,
        })
      );
      this.status = 'confirming';
      const transferTransactionConfirmation =
        await connection.confirmTransaction({
          signature: this.transactionSignature,
          blockhash: latestBlockhash.blockhash,
          lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        });

      if (transferTransactionConfirmation.value.err) {
        throw new Error(transferTransactionConfirmation.value.err.toString());
      }

      this.status = 'confirmed';

      console.log(
        '🎉 Transaction Succesfully Confirmed!',
        '\n',
        `https://explorer.solana.com/tx/${this.transactionSignature}`
      );

      this._matSnackBar.open('Transaction successfully confirmed.', 'close', {
        duration: 3000,
      });
    } catch (error) {
      console.error(error);
      this.error = error?.toString() || null;
      this.status = 'failed';
      this._matSnackBar.open('An error occurred.', 'close', {
        duration: 3000,
      });
    } finally {
      this.isRunning = false;
      this._matDialogRef.disableClose = false;
    }
  }

  onClose() {
    this._matDialogRef.close(false);
  }
}

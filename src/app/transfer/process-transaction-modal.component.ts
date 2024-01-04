import { Component, OnInit, effect, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TransactionInstruction } from '@solana/web3.js';
import { ProcessTransactionStore } from './process-transaction.store';

export interface ProcessTransactionModalData {
  transactionInstructions: TransactionInstruction[];
}

@Component({
  selector: 'my-bank-process-transaction-modal',
  template: `
    <header class="flex gap-4 items-center px-4 pt-4">
      <h2 class="grow">
        @switch (transactionStatus()) {
          @case ('pending') {
            Pending Transaction
          }
          @case ('sending') {
            Sending Transaction
          }
          @case ('confirming') {
            Confirming Transaction
          }
          @case ('failed') {
            Failed Transaction
          }
          @case ('confirmed') {
            Successful Transaction
          }
        }
      </h2>
      <button (click)="onClose()" mat-icon-button [disabled]="isRunning()">
        <mat-icon> close </mat-icon>
      </button>
    </header>

    <div class="p-4 min-w-[350px] max-w-[450px]">
      @if (
        transactionStatus() !== 'confirmed' && transactionStatus() !== 'failed'
      ) {
        <div class="flex flex-col gap-4 items-center">
          <mat-progress-spinner
            mode="indeterminate"
            diameter="64"
          ></mat-progress-spinner>
          <p class="text-sm italic text-center">
            Process... Do NOT reload the page.
          </p>
        </div>
      } @else if (transactionStatus() === 'confirmed') {
        <div>
          <p class="mb-2">
            Feel free to inspect the transaction on the Solana Explorer:
          </p>
          <p>
            <a
              [href]="
                'https://explorer.solana.com/tx/' +
                transactionResponse().signature
              "
              target="_blank"
              class="underline text-blue-400"
            >
              [view in explorer]
            </a>
          </p>
        </div>
      } @else if (transactionStatus() === 'failed') {
        <div>
          <p class="px-4 py-1 bg-red-200 text-red-600">
            {{ error() }}
          </p>
        </div>
      }
    </div>
  `,
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  providers: [ProcessTransactionStore],
})
export class ProcessTransactionModalComponent implements OnInit {
  private readonly _matDialogRef = inject(
    MatDialogRef<ProcessTransactionModalComponent>,
  );
  private readonly _data = inject<ProcessTransactionModalData>(MAT_DIALOG_DATA);
  private readonly _matSnackBar = inject(MatSnackBar);
  private readonly _processTransactionStore = inject(ProcessTransactionStore);

  readonly transactionResponse =
    this._processTransactionStore.transactionResponse;
  readonly transactionStatus = this._processTransactionStore.transactionStatus;
  readonly isRunning = this._processTransactionStore.isRunning;
  readonly error = this._processTransactionStore.error;

  readonly handleTransactionStatusUpdates = effect(() => {
    if (this._processTransactionStore.transactionStatus() === 'confirmed') {
      console.log(
        '🎉 Transaction Succesfully Confirmed!',
        '\n',
        `https://explorer.solana.com/tx/${
          this._processTransactionStore.transactionResponse().signature
        }`,
      );
      this._matSnackBar.open('Transaction successfully confirmed.', 'close', {
        duration: 3000,
      });
      this._matDialogRef.disableClose = false;
    } else if (this._processTransactionStore.transactionStatus() === 'failed') {
      console.error(this._processTransactionStore.error());
      this._matSnackBar.open('An error occurred.', 'close', {
        duration: 3000,
      });
      this._matDialogRef.disableClose = false;
    } else {
      this._matDialogRef.disableClose = true;
    }
  });

  ngOnInit() {
    this._processTransactionStore.setTransactionInstructions(
      this._data.transactionInstructions,
    );
  }

  onClose() {
    this._matDialogRef.close(false);
  }
}

import {
  Component,
  Injector,
  OnInit,
  computed,
  effect,
  inject,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConnectionStore, WalletStore } from '@heavy-duty/wallet-adapter';
import { SendTransactionOptions } from '@solana/wallet-adapter-base';
import {
  Connection,
  Transaction,
  TransactionInstruction,
  VersionedTransaction,
} from '@solana/web3.js';
import { firstValueFrom } from 'rxjs';
import { createTransactionSender } from '../utils';
import { ProcessTransactionSectionComponent } from './process-transaction-section.component';

export interface ProcessTransactionModalData {
  transactionInstructions: TransactionInstruction[];
}

@Component({
  selector: 'my-bank-process-transaction-modal',
  template: `
    <header class="flex gap-4 items-center px-4 pt-4">
      <h2 class="grow">
        {{ title() }}
      </h2>
      <button (click)="onClose()" mat-icon-button [disabled]="isRunning()">
        <mat-icon> close </mat-icon>
      </button>
    </header>

    <div class="p-4 min-w-[350px] max-w-[450px]">
      <my-bank-process-transaction-section
        [signature]="signature()"
        [error]="error()"
        [status]="status()"
        [explorerUrl]="explorerUrl()"
      ></my-bank-process-transaction-section>
    </div>
  `,
  standalone: true,
  imports: [MatButtonModule, MatIconModule, ProcessTransactionSectionComponent],
})
export class ProcessTransactionModalComponent implements OnInit {
  private readonly _injector = inject(Injector);
  private readonly _matDialogRef = inject(
    MatDialogRef<ProcessTransactionModalComponent>,
  );
  private readonly _data = inject<ProcessTransactionModalData>(MAT_DIALOG_DATA);
  private readonly _matSnackBar = inject(MatSnackBar);
  private readonly _walletStore = inject(WalletStore);
  private readonly _connectionStore = inject(ConnectionStore);

  readonly transactionSender = createTransactionSender(
    (
      transaction: Transaction | VersionedTransaction,
      connection: Connection,
      options?: SendTransactionOptions,
    ) => this._walletStore.sendTransaction(transaction, connection, options),
  );
  readonly error = computed(() => this.transactionSender().error);
  readonly isRunning = computed(
    () =>
      this.transactionSender().status !== 'confirmed' &&
      this.transactionSender().status !== 'failed',
  );
  readonly status = computed(() => this.transactionSender().status);
  readonly signature = computed(() => this.transactionSender().signature);
  readonly title = computed(() => {
    switch (this.status()) {
      case 'pending': {
        return 'Pending Transaction';
      }
      case 'sending': {
        return 'Sending Transaction';
      }
      case 'confirming': {
        return 'Confirming Transaction';
      }
      case 'failed': {
        return 'Failed Transaction';
      }
      case 'confirmed': {
        return 'Successful Transaction';
      }
    }
  });
  readonly explorerUrl = computed(
    () => `https://explorer.solana.com/tx/${this.signature()}`,
  );

  async ngOnInit() {
    const connection = await firstValueFrom(this._connectionStore.connection$);

    if (connection === null) {
      throw new Error('Connection not available.');
    }

    const publicKey = await firstValueFrom(this._walletStore.publicKey$);

    if (publicKey === null) {
      throw new Error('Public Key not available.');
    }

    this.transactionSender.send(
      connection,
      publicKey,
      this._data.transactionInstructions,
    );

    const handleStatusUpdates = effect(
      () => {
        if (this.status() === 'confirmed') {
          // Log in the console the result.
          console.log(
            '🎉 Transaction Succesfully Confirmed!',
            '\n',
            this.explorerUrl(),
          );

          // Display a toast notification.
          this._matSnackBar.open(
            'Transaction successfully confirmed.',
            'close',
            {
              duration: 3000,
            },
          );

          // Allow users closing the modal.
          this._matDialogRef.disableClose = false;

          // Destroy the effect.
          handleStatusUpdates.destroy();
        } else if (this.status() === 'failed') {
          // Log in the console the error.
          console.error(this.error());

          // Display a toast notification.
          this._matSnackBar.open('An error occurred.', 'close', {
            duration: 3000,
          });

          // Allow users closing the modal.
          this._matDialogRef.disableClose = false;

          // Destroy the effect.
          handleStatusUpdates.destroy();
        } else {
          this._matDialogRef.disableClose = true;
        }
      },
      { injector: this._injector },
    );
  }

  onClose() {
    this._matDialogRef.close(false);
  }
}

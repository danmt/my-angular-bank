import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  input,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LetDirective } from '@ngrx/component';
import { TransactionState } from '../utils';

@Component({
  selector: 'my-bank-process-transaction-section',
  template: `
    <div
      class="flex flex-col gap-4 items-center"
      *ngrxLet="transactionState() as transactionState"
    >
      @switch (transactionState.status) {
        @case ('pending') {
          <p>
            Your transaction is ready to be sent. Press the button to proceed.
          </p>

          <button
            mat-raised-button
            color="primary"
            (click)="onSendTransaction()"
          >
            Send Transaction
          </button>
        }

        @case ('confirmed') {
          <p class="mb-2">
            Feel free to inspect the transaction on the Solana Explorer:
          </p>
          <p>
            <a
              [href]="transactionState.explorerUrl"
              target="_blank"
              class="underline text-blue-400"
            >
              [view in explorer]
            </a>
          </p>
        }

        @case ('failed') {
          <p class="px-4 py-1 bg-red-200 text-red-600">
            {{ transactionState.error }}
          </p>
        }

        @default {
          <mat-progress-spinner
            mode="indeterminate"
            diameter="64"
          ></mat-progress-spinner>
          <p class="text-sm italic text-center">
            Processing... Do NOT reload the page.
          </p>
        }
      }
    </div>
  `,
  imports: [MatProgressSpinnerModule, MatButtonModule, LetDirective],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block',
  },
})
export class ProcessTransactionSectionComponent {
  transactionState = input.required<TransactionState>();
  @Output() sendTransaction = new EventEmitter();

  onSendTransaction() {
    this.sendTransaction.emit();
  }
}

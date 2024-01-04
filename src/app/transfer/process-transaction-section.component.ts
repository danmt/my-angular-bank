import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TransactionStatus } from '../utils';

@Component({
  selector: 'my-bank-process-transaction-section',
  template: `
    @if (
      status === 'pending' || status === 'sending' || status === 'confirming'
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
    } @else if (status === 'confirmed') {
      <div>
        <p class="mb-2">
          Feel free to inspect the transaction on the Solana Explorer:
        </p>
        <p>
          <a
            [href]="explorerUrl"
            target="_blank"
            class="underline text-blue-400"
          >
            [view in explorer]
          </a>
        </p>
      </div>
    } @else if (status === 'failed') {
      <div>
        <p class="px-4 py-1 bg-red-200 text-red-600">
          {{ error }}
        </p>
      </div>
    }
  `,
  standalone: true,
  imports: [MatProgressSpinnerModule],
})
export class ProcessTransactionSectionComponent {
  @Input({ required: true }) status: TransactionStatus = 'pending';
  @Input({ required: true }) signature: string | null = null;
  @Input({ required: true }) error: string | null = null;
  @Input({ required: true }) explorerUrl: string | null = null;
}

import { DatePipe, NgClass } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { PublicKey } from '@solana/web3.js';
import { Transaction } from '../utils';

@Component({
  standalone: true,
  imports: [NgClass, DatePipe, MatCardModule, MatIconModule, MatTableModule],
  selector: 'my-bank-transactions-section',
  template: `
    <mat-card class="px-4 py-8 w-[700px] h-full flex flex-col">
      <header class="mb-4">
        <h2 class="text-3xl text-center">Transaction History</h2>
      </header>

      @if (transactions === null) {
        <div
          class="bg-black bg-opacity-10 p-4 flex justify-center items-center"
        >
          <p class="text-center italic text-sm">
            Connect wallet to view transaction history.
          </p>
        </div>
      } @else if (transactions.length === 0) {
        <div
          class="bg-black bg-opacity-10 p-4 flex justify-center items-center"
        >
          <p class="text-center italic text-sm">
            The connected wallet has no transactions.
          </p>
        </div>
      } @else {
        <table mat-table [dataSource]="transactions">
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let element">
              {{ element.timestamp | date: 'short' }}
            </td>
          </ng-container>
          <ng-container matColumnDef="memo">
            <th mat-header-cell *matHeaderCellDef>Memo</th>
            <td mat-cell *matCellDef="let element">
              {{ element.memo ?? 'Unknown transaction.' }}
            </td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td
              mat-cell
              *matCellDef="let element"
              [ngClass]="{
                'text-green-500':
                  element.type === 'transfer' &&
                  publicKey !== null &&
                  element.sender !== publicKey.toBase58(),
                'text-red-500':
                  element.type === 'transfer' &&
                  publicKey !== null &&
                  element.sender === publicKey.toBase58()
              }"
              class="text-lg font-bold"
            >
              <div class="flex items-end">
                <p>
                  {{ element.amount !== undefined ? element.amount : '-' }}
                </p>
                @if (element.sign > 0) {
                  <mat-icon>trending_up</mat-icon>
                } @else if (element.sign < 0) {
                  <mat-icon>trending_down</mat-icon>
                }
              </div>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      }
    </mat-card>
  `,
})
export class TransactionsSectionComponent {
  @HostBinding() class = 'block';
  @Input({ required: true }) transactions: Transaction[] | null = null;
  @Input({ required: true }) publicKey: PublicKey | null = null;

  readonly displayedColumns = ['timestamp', 'memo', 'amount'];
}

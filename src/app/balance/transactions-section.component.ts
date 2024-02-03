import { DatePipe, NgClass } from '@angular/common';
import { Component, input } from '@angular/core';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
} from '@angular/material/table';
import { LetDirective } from '@ngrx/component';
import { Transaction } from '../models';

@Component({
  selector: 'my-bank-transactions-section',
  template: `
    <mat-card
      class="px-4 py-8 w-[700px] h-full flex flex-col"
      *ngrxLet="transactions() as transactions"
    >
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
                'text-green-500': element.isSender,
                'text-red-500': !element.isSender
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
  imports: [
    NgClass,
    DatePipe,
    MatCard,
    MatIcon,
    MatTable,
    MatRow,
    MatRowDef,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatColumnDef,
    LetDirective,
  ],
  standalone: true,
})
export class TransactionsSectionComponent {
  readonly displayedColumns = ['timestamp', 'memo', 'amount'];
  readonly transactions = input.required<Transaction[] | null>();
}

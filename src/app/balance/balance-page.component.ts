import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { HdWalletAdapterDirective } from '@heavy-duty/wallet-adapter-cdk';
import { LetDirective, PushPipe } from '@ngrx/component';
import { provideComponentStore } from '@ngrx/component-store';
import { PublicKey } from '@solana/web3.js';
import { QRCodeModule } from 'angularx-qrcode';
import { map } from 'rxjs';
import { RequestPaymentService } from '../payment';
import { ToUserValuePipe } from '../shared';
import { ProcessTransferService, TransferService } from '../transfer';
import { config, createSolanaPayUrl } from '../utils';
import { BalanceStore } from './balance.store';
import { TransactionsStore } from './transactions.store';

@Component({
  standalone: true,
  imports: [
    NgClass,
    DecimalPipe,
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    LetDirective,
    PushPipe,
    QRCodeModule,
    HdWalletAdapterDirective,
    ToUserValuePipe,
  ],
  selector: 'my-bank-balance-page',
  template: `
    <div class="flex gap-4 justify-center mb-4">
      <mat-card class="px-4 py-8 w-[500px] flex flex-col relative">
        <header class="mb-4">
          <h2 class="text-3xl text-center">Balance</h2>
        </header>

        <div class="absolute top-4 right-4">
          <button mat-mini-fab color="primary" (click)="onReload()">
            <mat-icon>refresh</mat-icon>
          </button>
        </div>

        <div
          *ngrxLet="balance$; let balance"
          class="grow flex justify-center items-center gap-2 mb-4"
        >
          <img src="assets/usdc-logo.png" class="w-24 h-24" />

          <p class="text-7xl">
            @if (balance !== null) {
            {{ balance | hdToUserValue | number : '2.2-2' }}
            } @else { - }
          </p>
        </div>

        <footer class="flex justify-center gap-2">
          <button (click)="onTransfer()" mat-raised-button color="primary">
            Transfer
          </button>

          <button
            (click)="onRequestPayment()"
            mat-raised-button
            color="primary"
          >
            Request Payment
          </button>
        </footer>
      </mat-card>

      <mat-card class="px-4 py-8 w-[400px]">
        <header class="mb-4">
          <h2 class="text-3xl text-center">Deposit using Solana Pay</h2>
        </header>

        <div
          *ngrxLet="solanaPayDepositUrl$; let solanaPayDepositUrl"
          class="flex justify-center"
        >
          @if ( solanaPayDepositUrl !== null) {
          <qrcode
            [qrdata]="solanaPayDepositUrl"
            [width]="256"
            [margin]="0"
            [errorCorrectionLevel]="'M'"
          ></qrcode>
          } @else {
          <div
            class="w-[256px] h-[256px] bg-black bg-opacity-10 p-4 flex justify-center items-center"
          >
            <p class="text-center italic text-sm">
              Connect wallet to view QR Code
            </p>
          </div>
          }
        </div>
      </mat-card>
    </div>

    <div class="flex justify-center">
      <mat-card class="px-4 py-8 w-[700px] flex flex-col">
        <header class="mb-4">
          <h2 class="text-3xl text-center">Transaction History</h2>
        </header>

        <ng-container *ngrxLet="transactions$; let transactions">
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
          <table mat-table [dataSource]="transactions" class="mat-elevation-z8">
            <ng-container matColumnDef="timestamp">
              <th mat-header-cell *matHeaderCellDef>Date</th>
              <td mat-cell *matCellDef="let element">
                {{ element.timestamp | date : 'short' }}
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
                    element.sign !== undefined && element.sign > 0,
                  'text-red-500': element.sign !== undefined && element.sign < 0
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
        </ng-container>
      </mat-card>
    </div>
  `,
  styles: [],
  providers: [
    provideComponentStore(BalanceStore),
    provideComponentStore(TransactionsStore),
  ],
})
export class BalancePageComponent {
  private readonly _walletStore = inject(WalletStore);
  private readonly _requestPaymentService = inject(RequestPaymentService);
  private readonly _processTransferService = inject(ProcessTransferService);
  private readonly _transferService = inject(TransferService);
  private readonly _balanceStore = inject(BalanceStore);
  private readonly _transactionsStore = inject(TransactionsStore);

  readonly displayedColumns = ['timestamp', 'memo', 'amount'];
  readonly balance$ = this._balanceStore.balance$;
  readonly solanaPayDepositUrl$ = this._walletStore.publicKey$.pipe(
    map((publicKey) => {
      if (!publicKey) {
        return null;
      }

      return createSolanaPayUrl({
        receiver: publicKey.toBase58(),
        mint: config.mint,
      });
    })
  );
  readonly transactions$ = this._transactionsStore.transactions$;

  onReload() {
    this._balanceStore.reload();
    this._transactionsStore.reload();
  }

  async onTransfer() {
    try {
      const transferPayload = await this._transferService.transfer();

      if (transferPayload) {
        await this._processTransferService.processTransfer({
          receiver: new PublicKey(transferPayload.receiver),
          amount: transferPayload.amount,
          memo: transferPayload.memo,
        });
      }
    } catch (error) {
      console.error('An error occured while transfering.', error);
    }
  }

  async onRequestPayment() {
    try {
      await this._requestPaymentService.requestPayment();
    } catch (error) {
      console.error('An error occured while requesting payment.', error);
    }
  }
}

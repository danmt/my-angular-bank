import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LetDirective } from '@ngrx/component';
import { ToUserValuePipe } from '../shared';

@Component({
  selector: 'my-bank-balance-section',
  template: `
    <mat-card class="px-4 py-8 w-[500px] h-full flex flex-col relative">
      <header class="mb-4">
        <h2 class="text-3xl text-center">Balance</h2>
      </header>

      <div class="absolute top-4 right-4">
        <button mat-mini-fab color="primary" (click)="onReload()">
          <mat-icon>refresh</mat-icon>
        </button>
      </div>

      <div class="grow flex justify-center items-center gap-2 mb-4">
        <img src="assets/usdc-logo.png" class="w-24 h-24" />

        <p class="text-7xl" *ngrxLet="balance() as balance">
          @if (balance !== null) {
            {{ balance | number: '2.2-2' }}
          } @else {
            -
          }
        </p>
      </div>

      <footer class="flex justify-center gap-2">
        <button (click)="onTransfer()" mat-raised-button color="primary">
          Transfer
        </button>

        <button (click)="onRequestPayment()" mat-raised-button color="primary">
          Request Payment
        </button>
      </footer>
    </mat-card>
  `,
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    LetDirective,
    ToUserValuePipe,
  ],
  standalone: true,
})
export class BalanceSectionComponent {
  readonly balance = input.required<number | null>();
  @Output() readonly reload = new EventEmitter();
  @Output() readonly transfer = new EventEmitter();
  @Output() readonly requestPayment = new EventEmitter();

  onReload() {
    this.reload.emit();
  }

  onTransfer() {
    this.transfer.emit();
  }

  onRequestPayment() {
    this.requestPayment.emit();
  }
}

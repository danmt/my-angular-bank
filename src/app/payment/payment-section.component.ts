import { ClipboardModule } from '@angular/cdk/clipboard';
import { DecimalPipe } from '@angular/common';
import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { HdObscureAddressPipe } from '@heavy-duty/wallet-adapter-cdk';
import { ToUserValuePipe } from '../shared';

@Component({
  standalone: true,
  imports: [
    DecimalPipe,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    ClipboardModule,
    HdObscureAddressPipe,
    ToUserValuePipe,
  ],
  selector: 'my-bank-payment-section',
  template: `
    <mat-card class="px-4 py-8 w-[500px] h-full">
      <header class="mb-4">
        <h2 class="text-3xl text-center mb-4">Payment Details</h2>
      </header>

      <div>
        <p class="font-bold text-lg">Details</p>
        <p class="pl-4 mb-4">
          @if (memo !== null) {
            {{ memo }}
          } @else {
            -
          }
        </p>
        <p class="font-bold text-lg">Requested by</p>
        <p class="pl-4 flex items-center gap-4 mb-4">
          @if (requester !== null) {
            {{ requester | hdObscureAddress }}
            <button
              mat-icon-button
              [cdkCopyToClipboard]="requester"
              class="-scale-[0.85]"
            >
              <mat-icon>content_copy</mat-icon>
            </button>
          } @else {
            -
          }
        </p>
        <hr class="mb-4" />
        <div class="flex justify-center items-center gap-2 mb-4">
          <img src="assets/usdc-logo.png" class="w-12 h-12" />
          <p class="text-4xl">
            @if (amount !== null) {
              {{ amount | hdToUserValue | number: '2.2-2' }}
            } @else {
              -
            }
          </p>
        </div>
        <div class="flex justify-center">
          <button
            mat-raised-button
            color="primary"
            (click)="onApprovePayment()"
          >
            Approve Payment
          </button>
        </div>
      </div>
    </mat-card>
  `,
})
export class PaymentSectionComponent {
  @HostBinding() class = 'block';
  @Input({ required: true }) amount: number | null = null;
  @Input({ required: true }) memo: string | null = null;
  @Input({ required: true }) requester: string | null = null;
  @Output() approvePayment = new EventEmitter();

  onApprovePayment() {
    this.approvePayment.emit();
  }
}

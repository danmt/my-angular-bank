import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { DecimalPipe } from '@angular/common';
import { Component, EventEmitter, Output, input } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatCard } from '@angular/material/card';
import { MatIcon } from '@angular/material/icon';
import { HdObscureAddressPipe } from '@heavy-duty/wallet-adapter-cdk';
import { LetDirective } from '@ngrx/component';
import { ToUserValuePipe } from '../shared';

@Component({
  selector: 'my-bank-payment-section',
  template: `
    <mat-card class="px-4 py-8 w-[500px] h-full">
      <header class="mb-4">
        <h2 class="text-3xl text-center mb-4">Payment Details</h2>
      </header>

      <div>
        <p class="font-bold text-lg">Details</p>
        <p class="pl-4 mb-4" *ngrxLet="memo() as memo">
          @if (memo !== null) {
            {{ memo }}
          } @else {
            -
          }
        </p>
        <p class="font-bold text-lg">Requested by</p>
        <p
          class="pl-4 flex items-center gap-4 mb-4"
          *ngrxLet="requester() as requester"
        >
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
          <p class="text-4xl" *ngrxLet="amount() as amount">
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
  imports: [
    DecimalPipe,
    MatButton,
    MatCard,
    MatIcon,
    CdkCopyToClipboard,
    LetDirective,
    HdObscureAddressPipe,
    ToUserValuePipe,
  ],
  standalone: true,
})
export class PaymentSectionComponent {
  readonly amount = input.required<number | null>();
  readonly memo = input.required<string | null>();
  readonly requester = input.required<string | null>();
  @Output() readonly approvePayment = new EventEmitter();

  onApprovePayment() {
    this.approvePayment.emit();
  }
}

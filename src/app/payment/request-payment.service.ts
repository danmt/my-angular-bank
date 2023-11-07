import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { WalletService } from '../core';
import {
  PaymentRequestModalComponent,
  PaymentRequestModalData,
} from './payment-request-modal.component';
import { RequestPaymentFormPayload } from './request-payment-form.component';
import { RequestPaymentModalComponent } from './request-payment-modal.component';

@Injectable({ providedIn: 'root' })
export class RequestPaymentService {
  private readonly _matDialog = inject(MatDialog);
  private readonly _walletService = inject(WalletService);

  async requestPayment() {
    const requester = await this._walletService.getOrConnectWallet();
    const requestPaymentPayload = await lastValueFrom(
      this._matDialog
        .open<RequestPaymentModalComponent, {}, RequestPaymentFormPayload>(
          RequestPaymentModalComponent
        )
        .afterClosed()
    );

    if (requestPaymentPayload) {
      await lastValueFrom(
        this._matDialog
          .open<PaymentRequestModalComponent, PaymentRequestModalData>(
            PaymentRequestModalComponent,
            {
              data: {
                amount: requestPaymentPayload.amount,
                memo: requestPaymentPayload.memo,
                requester: requester,
              },
            }
          )
          .afterClosed()
      );
    }
  }
}

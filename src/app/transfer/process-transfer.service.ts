import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { WalletService } from '../core';
import {
  ProcessTransferModalComponent,
  ProcessTransferModalData,
} from './process-transfer-modal.component';

@Injectable({ providedIn: 'root' })
export class ProcessTransferService {
  private readonly _matDialog = inject(MatDialog);
  private readonly _walletService = inject(WalletService);

  async processTransfer(payload: Omit<ProcessTransferModalData, 'sender'>) {
    const sender = await this._walletService.getOrConnectWallet();

    return await lastValueFrom(
      this._matDialog
        .open<ProcessTransferModalComponent, ProcessTransferModalData, string>(
          ProcessTransferModalComponent,
          {
            data: {
              sender,
              amount: payload.amount,
              receiver: payload.receiver,
              memo: payload.memo,
            },
          }
        )
        .afterClosed()
    );
  }
}

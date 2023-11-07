import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { TransferFormPayload, TransferModalComponent } from '../transfer';

@Injectable({ providedIn: 'root' })
export class TransferService {
  private readonly _matDialog = inject(MatDialog);

  async transfer() {
    return await lastValueFrom(
      this._matDialog
        .open<TransferModalComponent, {}, TransferFormPayload>(
          TransferModalComponent
        )
        .afterClosed()
    );
  }
}

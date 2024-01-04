import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { lastValueFrom } from 'rxjs';
import { UpdateSettingsFormPayload } from './update-settings-form.component';
import {
  UpdateSettingsModalComponent,
  UpdateSettingsModalData,
} from './update-settings-modal.component';

@Injectable({ providedIn: 'root' })
export class UpdateSettingsService {
  private readonly _matDialog = inject(MatDialog);

  async updateSettings(payload: UpdateSettingsModalData) {
    return await lastValueFrom(
      this._matDialog
        .open<
          UpdateSettingsModalComponent,
          UpdateSettingsModalData,
          UpdateSettingsFormPayload
        >(UpdateSettingsModalComponent, { data: payload })
        .afterClosed(),
    );
  }
}

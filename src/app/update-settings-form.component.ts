import { NgIf } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface UpdateSettingsFormModel {
  rpcEndpoint: string | null;
}

export interface UpdateSettingsFormPayload {
  rpcEndpoint: string;
}

@Component({
  selector: 'my-bank-update-settings-form',
  template: `
    <form #form="ngForm" (ngSubmit)="onSubmit(form)">
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>RPC Endpoint</mat-label>
        <input
          matInput
          name="rpcEndpoint"
          [(ngModel)]="model.rpcEndpoint"
          #rpcEndpointControl="ngModel"
          required
        />
        <mat-error
          *ngIf="form.submitted && rpcEndpointControl.errors?.['required']"
        >
          RPC Endpoint is required.
        </mat-error>
      </mat-form-field>

      <div>
        <button
          type="submit"
          [disabled]="disabled"
          mat-raised-button
          color="primary"
        >
          Save
        </button>
      </div>
    </form>
  `,
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
})
export class UpdateSettingsFormComponent {
  private readonly _matSnackBar = inject(MatSnackBar);

  @Input() model: UpdateSettingsFormModel = {
    rpcEndpoint: null,
  };
  @Input() disabled = false;
  @Output() updateSettings = new EventEmitter<UpdateSettingsFormPayload>();

  onSubmit(form: NgForm) {
    if (form.invalid || this.model.rpcEndpoint === null) {
      this._matSnackBar.open('Invalid data, review form entries.', 'close', {
        duration: 3000,
      });
    } else {
      this.updateSettings.emit({
        rpcEndpoint: this.model.rpcEndpoint,
      });
    }
  }
}

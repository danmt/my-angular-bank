import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface UpdateSettingsFormModel {
  shyftApiKey: string | null;
}

export interface UpdateSettingsFormPayload {
  shyftApiKey: string;
}

@Component({
  selector: 'my-bank-update-settings-form',
  template: `
    <form #form="ngForm" (ngSubmit)="onSubmit(form)">
      <mat-form-field appearance="fill" class="w-full">
        <mat-label>Shyft API Key</mat-label>
        <input
          matInput
          name="shyftApiKey"
          [(ngModel)]="model.shyftApiKey"
          #shyftApiKeyControl="ngModel"
          required
        />
        @if (form.submitted && shyftApiKeyControl.errors?.['required']) {
          <mat-error> Shyft API Key is required. </mat-error>
        }

        @if (form.submitted && shyftApiKeyControl.errors) {
          <mat-error>
            @if (shyftApiKeyControl.errors['required']) {
              Shyft API Key is required.
            }
          </mat-error>
        }
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
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
})
export class UpdateSettingsFormComponent {
  private readonly _matSnackBar = inject(MatSnackBar);

  @Input() model: UpdateSettingsFormModel = {
    shyftApiKey: null,
  };
  @Input() disabled = false;
  @Output() updateSettings = new EventEmitter<UpdateSettingsFormPayload>();

  onSubmit(form: NgForm) {
    if (form.invalid || this.model.shyftApiKey === null) {
      this._matSnackBar.open('Invalid data, review form entries.', 'close', {
        duration: 3000,
      });
    } else {
      this.updateSettings.emit({
        shyftApiKey: this.model.shyftApiKey,
      });
    }
  }
}

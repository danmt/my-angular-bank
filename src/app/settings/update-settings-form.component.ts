import { Component, EventEmitter, Output, inject, input } from '@angular/core';
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
          [(ngModel)]="model().shyftApiKey"
          #shyftApiKeyControl="ngModel"
          required
        />
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
          [disabled]="disabled()"
          mat-raised-button
          color="primary"
        >
          Save
        </button>
      </div>
    </form>
  `,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  standalone: true,
})
export class UpdateSettingsFormComponent {
  private readonly _matSnackBar = inject(MatSnackBar);

  readonly model = input<UpdateSettingsFormModel>({
    shyftApiKey: null,
  });
  readonly disabled = input(false);
  @Output() readonly updateSettings =
    new EventEmitter<UpdateSettingsFormPayload>();

  onSubmit(form: NgForm) {
    const model = this.model();

    if (form.invalid || model.shyftApiKey === null) {
      this._matSnackBar.open('Invalid data, review form entries.', 'close', {
        duration: 3000,
      });
    } else {
      this.updateSettings.emit({
        shyftApiKey: model.shyftApiKey,
      });
    }
  }
}

Hazzles:

- Install the dependencies.
- Setup the polyfills.

Concrete Tasks:

- Instantiate wallet-adapter into the application.
- Display multi-button in the application.
- Create the Shyft API Service.
- Create the Update Settings modal.
- Set Connection Endpoint on application initialization.
- Create Balance Store.
- Create Balance Section.
- Create Balance Page.
- Create Transactions Store.
- Create Transactions Section.

Things to Learn:

- How to provide the wallet adapter.
- How to use the wallet multi button.
- How to create and use a service.
- How to create and use a form.
- How to create and use a modal.
- How to create and use a store.
- How to create and use a section.
- How to create and use a page.
- How to use a router outlet and set up routes.
- What is an URL creator method.
- What is a transformation method.
- What is stringification.

---

Install all the required dependencies:

```bash
npm i -S @heavy-duty/wallet-adapter @heavy-duty/wallet-adapter-cdk @heavy-duty/wallet-adapter-material @solana/spl-token ngxtension @solana/web3.js
```

Create a polyfills file:

```javascript
import { Buffer } from 'buffer';

(window as any).global = window;
(window as any).global.Buffer = Buffer;
```

Add the polyfills file to the files in tsconfig.app and in the project.json.

Go to the app.config file and provide the wallet adapter using `provideWalletAdapter`

Go to the app.component and import the `HdWalletMultiButtonComponent`.

Insert the `<hd-wallet-multi-button></hd-wallet-multi-button>` in the template to show the wallet multi-button.

Create a Shyft API Service

```typescript
import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { PublicKey } from '@solana/web3.js';
import { map } from 'rxjs';
import {
  RawAccount,
  RawTransaction,
  config,
  createEndpointUrl,
  createTokenBalanceUrl,
  createTransactionHistoryUrl,
  toAccount,
  toTransaction,
} from '../utils';

@Injectable({ providedIn: 'root' })
export class ShyftApiService {
  private readonly _httpClient = inject(HttpClient);

  readonly shyftApiKey = signal(
    localStorage.getItem('shyftApiKey') ?? config.shyftApiKey,
  );
  readonly endpoint = computed(() => createEndpointUrl(this.shyftApiKey()));
  readonly syncLocalStorage = effect(() => {
    localStorage.setItem('shyftApiKey', this.shyftApiKey());
  });

  private readonly _headers = computed(() => ({
    'x-api-key': this.shyftApiKey(),
  }));

  getAccount(publicKey: PublicKey) {
    const url = createTokenBalanceUrl({
      publicKey: publicKey.toBase58(),
      mint: config.mint,
    });

    return this._httpClient
      .get<{ result: RawAccount }>(url, { headers: this._headers() })
      .pipe(map(({ result }) => toAccount(result)));
  }

  getTransactions(publicKey: PublicKey) {
    const url = createTransactionHistoryUrl({
      account: publicKey.toBase58(),
      limit: 3,
    });

    return this._httpClient
      .get<{ result: RawTransaction[] }>(url, { headers: this._headers() })
      .pipe(map(({ result }) => result.map(toTransaction)));
  }

  setShyftApiKey(shyftApiKey: string) {
    this.shyftApiKey.set(shyftApiKey);
  }
}
```

Create an Update Settings modal, starting with a form:

```typescript
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
```

and then the modal itself:

```typescript
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  UpdateSettingsFormComponent,
  UpdateSettingsFormPayload,
} from './update-settings-form.component';

export interface UpdateSettingsModalData {
  shyftApiKey: string;
}

@Component({
  selector: 'my-bank-update-settings-modal',
  template: `
    <header class="flex gap-4 items-center px-4 pt-4">
      <h2 class="grow">Update Settings</h2>
      <button (click)="onClose()" mat-icon-button>
        <mat-icon> close </mat-icon>
      </button>
    </header>

    <div class="p-4 min-w-[350px]">
      <my-bank-update-settings-form
        [model]="{
          shyftApiKey: data.shyftApiKey
        }"
        (updateSettings)="onUpdateSettings($event)"
      ></my-bank-update-settings-form>
    </div>

    <footer class="flex gap-2 justify-center items-center pb-4">
      <p>RPC and API Powered by</p>
      <a href="https://shyft.to" target="_blank">
        <img src="assets/shyft-logo.png" class="w-8 h-8" />
      </a>
    </footer>
  `,
  standalone: true,
  imports: [MatButtonModule, MatIconModule, UpdateSettingsFormComponent],
})
export class UpdateSettingsModalComponent {
  private readonly _matDialogRef = inject(
    MatDialogRef<UpdateSettingsModalComponent>,
  );

  readonly data = inject<UpdateSettingsModalData>(MAT_DIALOG_DATA);

  async onUpdateSettings(payload: UpdateSettingsFormPayload) {
    this._matDialogRef.close(payload);
  }

  onClose() {
    this._matDialogRef.close(false);
  }
}
```

Create the Balance store:

```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { computedFrom } from 'ngxtension/computed-from';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ShyftApiService } from '../core';
import { stringifyError } from '../utils';

export interface BalanceState {
  balance: number | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable()
export class BalanceStore {
  private readonly _shyftApiService = inject(ShyftApiService);
  private readonly _walletStore = inject(WalletStore);
  private readonly _reload = signal(Date.now());

  readonly state = computedFrom(
    [this._walletStore.publicKey$, this._reload],
    switchMap(([publicKey]) => {
      if (!publicKey) {
        return of({ isLoading: false as const, error: null, balance: 0 });
      }

      return this._shyftApiService.getAccount(publicKey).pipe(
        map((associatedTokenAccount) => ({
          isLoading: false as const,
          error: null,
          balance: associatedTokenAccount
            ? Number(associatedTokenAccount.amount)
            : 0,
        })),
        startWith({
          isLoading: true as const,
          balance: null,
          error: null,
        }),
        catchError((error) =>
          of({
            error: stringifyError(error),
            balance: null,
            isLoading: false as const,
          }),
        ),
      );
    }),
  );
  readonly balance = computed(() => this.state().balance);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);

  reload() {
    this._reload.set(Date.now());
  }
}
```

Create the Balance section:

```typescript
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

@Component({
  standalone: true,
  imports: [DecimalPipe, MatButtonModule, MatCardModule, MatIconModule],
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

        <p class="text-7xl">
          @if (balance !== null) {
            {{ balance | number: '2.2-2' }}
          } @else {
            -
          }
        </p>
      </div>
    </mat-card>
  `,
})
export class BalanceSectionComponent {
  @HostBinding() class = 'block';
  @Input({ required: true }) balance: number | null = null;
  @Output() reload = new EventEmitter();

  onReload() {
    this.reload.emit();
  }
}
```

Create the transactions store:

```typescript
import { Injectable, computed, inject, signal } from '@angular/core';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { getAssociatedTokenAddressSync } from '@solana/spl-token';
import { PublicKey } from '@solana/web3.js';
import { computedFrom } from 'ngxtension/computed-from';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { ShyftApiService } from '../core';
import { Transaction, config, stringifyError } from '../utils';

export interface TransactionsState {
  transactions: Transaction[] | null;
  isLoading: boolean;
  error: string | null;
}

@Injectable()
export class TransactionsStore {
  private readonly _shyftApiService = inject(ShyftApiService);
  private readonly _walletStore = inject(WalletStore);
  private readonly _reload = signal(Date.now());

  readonly state = computedFrom(
    [this._walletStore.publicKey$, this._reload],
    switchMap(([publicKey]) => {
      if (!publicKey) {
        return of({
          isLoading: false as const,
          transactions: null,
          error: null,
        });
      }

      const associatedTokenPubkey = getAssociatedTokenAddressSync(
        new PublicKey(config.mint),
        publicKey,
      );

      return this._shyftApiService.getTransactions(associatedTokenPubkey).pipe(
        map((transactions) => ({
          isLoading: false as const,
          transactions,
          error: null,
        })),
        startWith({
          isLoading: true as const,
          transactions: null,
          error: null,
        }),
        catchError((error) =>
          of({
            isLoading: false as const,
            transactions: null,
            error: stringifyError(error),
          }),
        ),
      );
    }),
  );
  readonly transactions = computed(() => this.state().transactions);
  readonly isLoading = computed(() => this.state().isLoading);
  readonly error = computed(() => this.state().error);

  reload() {
    this._reload.set(Date.now());
  }
}
```

Create the transactions section:

```typescript
import { DatePipe, NgClass } from '@angular/common';
import { Component, HostBinding, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { PublicKey } from '@solana/web3.js';
import { Transaction } from '../utils';

@Component({
  standalone: true,
  imports: [NgClass, DatePipe, MatCardModule, MatIconModule, MatTableModule],
  selector: 'my-bank-transactions-section',
  template: `
    <mat-card class="px-4 py-8 w-[700px] h-full flex flex-col">
      <header class="mb-4">
        <h2 class="text-3xl text-center">Transaction History</h2>
      </header>

      @if (transactions === null) {
        <div
          class="bg-black bg-opacity-10 p-4 flex justify-center items-center"
        >
          <p class="text-center italic text-sm">
            Connect wallet to view transaction history.
          </p>
        </div>
      } @else if (transactions.length === 0) {
        <div
          class="bg-black bg-opacity-10 p-4 flex justify-center items-center"
        >
          <p class="text-center italic text-sm">
            The connected wallet has no transactions.
          </p>
        </div>
      } @else {
        <table mat-table [dataSource]="transactions">
          <ng-container matColumnDef="timestamp">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let element">
              {{ element.timestamp | date: 'short' }}
            </td>
          </ng-container>
          <ng-container matColumnDef="memo">
            <th mat-header-cell *matHeaderCellDef>Memo</th>
            <td mat-cell *matCellDef="let element">
              {{ element.memo ?? 'Unknown transaction.' }}
            </td>
          </ng-container>
          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td
              mat-cell
              *matCellDef="let element"
              [ngClass]="{
                'text-green-500':
                  element.type === 'transfer' &&
                  publicKey !== null &&
                  element.sender !== publicKey.toBase58(),
                'text-red-500':
                  element.type === 'transfer' &&
                  publicKey !== null &&
                  element.sender === publicKey.toBase58()
              }"
              class="text-lg font-bold"
            >
              <div class="flex items-end">
                <p>
                  {{ element.amount !== undefined ? element.amount : '-' }}
                </p>
                @if (element.sign > 0) {
                  <mat-icon>trending_up</mat-icon>
                } @else if (element.sign < 0) {
                  <mat-icon>trending_down</mat-icon>
                }
              </div>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>
      }
    </mat-card>
  `,
})
export class TransactionsSectionComponent {
  @HostBinding() class = 'block';
  @Input({ required: true }) transactions: Transaction[] | null = null;
  @Input({ required: true }) publicKey: PublicKey | null = null;

  readonly displayedColumns = ['timestamp', 'memo', 'amount'];
}
```

Create the Balance page:

```typescript
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { WalletStore } from '@heavy-duty/wallet-adapter';
import { BalanceSectionComponent } from './balance-section.component';
import { BalanceStore } from './balance.store';
import { TransactionsSectionComponent } from './transactions-section.component';
import { TransactionsStore } from './transactions.store';

@Component({
  standalone: true,
  imports: [BalanceSectionComponent, TransactionsSectionComponent],
  selector: 'my-bank-balance-page',
  template: `
    <div class="flex gap-4 justify-center mb-4">
      <my-bank-balance-section
        [balance]="balance()"
        (reload)="onReload()"
      ></my-bank-balance-section>
    </div>

    <div class="flex justify-center">
      <my-bank-transactions-section
        [transactions]="transactions()"
        [publicKey]="publicKey()"
      ></my-bank-transactions-section>
    </div>
  `,
  providers: [BalanceStore, TransactionsStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BalancePageComponent {
  private readonly _walletStore = inject(WalletStore);
  private readonly _balanceStore = inject(BalanceStore);
  private readonly _transactionsStore = inject(TransactionsStore);

  readonly balance = this._balanceStore.balance;
  readonly publicKey = toSignal(this._walletStore.publicKey$, {
    initialValue: null,
  });
  readonly transactions = this._transactionsStore.transactions;

  onReload() {
    this._balanceStore.reload();
    this._transactionsStore.reload();
  }
}
```

Configure the routes:

```typescript
import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'balance',
    loadComponent: () =>
      import('./balance').then((m) => m.BalancePageComponent),
  },
  {
    path: '**',
    redirectTo: 'balance',
  },
];
```

Add the router module to the app component.

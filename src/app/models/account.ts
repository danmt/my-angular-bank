export interface RawAccount {
  balance: number;
}

export interface Account {
  amount: number;
}

export function toAccount<T extends RawAccount>(rawAccount: T): Account {
  return { amount: rawAccount.balance };
}

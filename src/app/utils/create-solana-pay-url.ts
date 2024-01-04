export interface CreateSolanaPayUrlOptions {
  receiver: string;
  mint?: string;
  memo?: string;
  amount?: number;
}

export function createSolanaPayUrl(options: CreateSolanaPayUrlOptions): string {
  const solanaPayUrl = new URL(`solana:${options.receiver}`);

  if (options.mint !== undefined) {
    solanaPayUrl.searchParams.append('spl-token', options.mint);
  }

  if (options.amount !== undefined) {
    solanaPayUrl.searchParams.append('amount', options.amount.toString());
  }

  if (options.memo !== undefined) {
    solanaPayUrl.searchParams.append('memo', options.memo);
  }

  return solanaPayUrl.toString();
}

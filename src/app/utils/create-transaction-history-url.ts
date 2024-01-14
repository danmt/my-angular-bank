export interface CreateTransactionHistoryUrlOptions {
  account: string;
  limit: number;
}

export function createTransactionHistoryUrl(
  options: CreateTransactionHistoryUrlOptions,
): string {
  const url = new URL('https://api.shyft.to/sol/v1/transaction/history');

  url.searchParams.append('network', 'mainnet-beta');
  url.searchParams.append('tx_num', options.limit.toString());
  url.searchParams.append('account', options.account);

  return url.toString();
}

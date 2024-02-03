export interface CreateTokenBalanceUrlOptions {
  publicKey: string;
  mint: string;
}

export function createTokenBalanceUrl(
  options: CreateTokenBalanceUrlOptions,
): string {
  const url = new URL('https://api.shyft.to/sol/v1/wallet/token_balance');

  url.searchParams.append('network', 'mainnet-beta');
  url.searchParams.append('wallet', options.publicKey);
  url.searchParams.append('token', options.mint);

  return url.toString();
}

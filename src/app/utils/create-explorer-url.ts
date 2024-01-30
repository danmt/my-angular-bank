export function createExplorerUrl(signature: string) {
  const url = new URL(`https://explorer.solana.com/tx/${signature}`);

  return url.toString();
}

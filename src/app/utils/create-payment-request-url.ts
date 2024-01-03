import { config } from './config';

export interface CreatePaymentRequestUrlOptions {
  requester: string;
  memo: string;
  amount: number;
}

export function createPaymentRequestUrl(
  options: CreatePaymentRequestUrlOptions
): string {
  const url = new URL(`${config.baseUrl}/payment`);

  url.searchParams.append('amount', options.amount.toString());
  url.searchParams.append('memo', options.memo);
  url.searchParams.append('requester', options.requester);

  return url.toString();
}

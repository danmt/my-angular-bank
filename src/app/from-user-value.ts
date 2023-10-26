import { config } from './config';

export function fromUserValue(
  value: number,
  decimals: number = config.decimals
) {
  return value * 10 ** decimals;
}

import { config } from './config';

export function toUserValue(value: number, decimals: number = config.decimals) {
  return value / 10 ** decimals;
}

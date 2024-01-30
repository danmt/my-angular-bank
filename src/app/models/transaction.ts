import { PublicKey } from '@solana/web3.js';

export interface RawTransaction {
  type: string;
  actions: {
    info: { message: string; amount: number; sender: string };
  }[];
  timestamp: number;
}

export type Transaction =
  | {
      type: 'unknown';
      timestamp: Date;
    }
  | {
      type: 'transfer';
      memo: string;
      sender: string;
      amount: number;
      timestamp: Date;
      isSender: boolean;
    };

export function createTransactionFactory(publicKey: PublicKey) {
  return <T extends RawTransaction>(rawTransaction: T): Transaction => {
    if (
      rawTransaction.type !== 'TOKEN_TRANSFER' ||
      rawTransaction.actions.length !== 2
    ) {
      return {
        timestamp: new Date(rawTransaction.timestamp),
        type: 'unknown',
      };
    }

    const memo = rawTransaction.actions[1].info.message;
    const amount = rawTransaction.actions[0].info.amount;
    const sender = rawTransaction.actions[0].info.sender;

    return {
      timestamp: new Date(rawTransaction.timestamp),
      memo,
      amount,
      sender,
      isSender: publicKey.toBase58() === sender,
      type: 'transfer' as const,
    };
  };
}

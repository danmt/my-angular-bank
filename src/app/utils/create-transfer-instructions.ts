import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { config } from './config';

export function createTransferInstructions(
  sender: PublicKey,
  receiver: PublicKey,
  amount: number,
  memo: string,
) {
  const senderAssociatedTokenPubkey = getAssociatedTokenAddressSync(
    new PublicKey(config.mint),
    sender,
  );
  const receiverAssociatedTokenPubkey = getAssociatedTokenAddressSync(
    new PublicKey(config.mint),
    receiver,
  );

  return [
    createTransferInstruction(
      senderAssociatedTokenPubkey,
      receiverAssociatedTokenPubkey,
      sender,
      amount,
    ),
    new TransactionInstruction({
      keys: [{ pubkey: sender, isSigner: true, isWritable: true }],
      data: Buffer.from(memo, 'utf-8'),
      programId: new PublicKey(config.memoProgramId),
    }),
  ];
}

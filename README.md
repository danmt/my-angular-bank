# My Bank

This repository showcases how to interact with Solana using an Angular application.

## Wallet Integration

The application integrates with wallets using @heavy-duty/wallet-adapter. It supports Backpack, Phantom and Glow. If you need another wallet integrated, you can raise an issue.

## Display USDC Balance

Once a wallet is connected, it's USDC balance is shown to the user.

## Transfer USDC

Users can transfer USDC to another user by entering their public key and an amount.

Users can trasnfer USDC by clicking a button that opens a modal that prompts for a receiver's public key and an amount. A transfer transaction is created and send to the connected wallet.

NOTE: If there's no wallet connect, the user is prompted to connect one.

## Request Payment in USDC (WIP)

Users can request a payment in USDC by clicking a button that opens a modal that prompts for an amount. This generates a link that can be shared to the payer. Opening a payment link automatically opens the transfer modal with the values provided in the link as defaults.

NOTE: If there's no wallet connect, the user is prompted to connect one.

## Memos (WIP)

Whenever a transaction is sent, a memo can be attached to make it easier to identify the purpose of a transaction. Transfers have a field to enter such information when transfering. For payments, this is automatically filled using the link values.

## QR Codes and Solana Pay (WIP)

Users have a QR that can be read to directly send funds to the connected wallet. Also, when a payment is requested, a QR code is displayed to the user that can be read to send the payment.

NOTE: Both cases use Solana Pay Standard.

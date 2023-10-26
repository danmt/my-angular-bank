# My Bank

This repository showcases how to interact with Solana using an Angular application.

## Wallet Integration

The application integrates with wallets using @heavy-duty/wallet-adapter. It supports Backpack, Phantom and Glow. If you need another wallet integrated, you can raise an issue.

## Display USDC Balance

Once a wallet is connected, it's USDC balance is shown to the user. There's a page dedicated for the user's balance, alongside options available like transfering and requesting a payment.

## Transfer USDC

Users can transfer USDC to another user by entering their public key and an amount.

Users can trasnfer USDC by clicking a button that opens a modal that prompts for a receiver's public key and an amount. A transfer transaction is created and send to the connected wallet.

NOTE: If there's no wallet connect, the user is prompted to connect one.

## Memos

Whenever a transaction is sent, a memo can be attached to make it easier to identify the purpose of a transaction. Transfers have a field to enter such information when transfering. For payments, this is automatically filled using the link values.

## Request Payment in USDC

Users can request a payment in USDC by clicking a button that opens a modal that prompts for an amount. This generates a link that can be shared to the payer. Opening a payment link goes to a page where the user can read the payment details and proceed to approve the payment, firing a transfer transaction.

NOTE: If there's no wallet connect, the user is prompted to connect one.

## QR Codes and Solana Pay

Users have a QR that can be read to directly send funds to the connected wallet. Also, when a payment is requested, a QR code is displayed to the user that can be read to send the payment. The payment page displays the QR for users that don't want to connect their wallets with our site.

NOTE: This is all powered by the Solana Pay Standard.

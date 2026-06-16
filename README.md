# StellarPay — Stellar White Belt dApp

## Project Description
StellarPay is a streamlined, visually stunning payment application built on the Stellar Testnet. Designed to demonstrate the ease of integrating Stellar blockchain operations into modern web applications, the dApp allows users to connect their Freighter wallet, verify their account status, fund accounts utilizing Stellar's testnet Friendbot, and execute native XLM token payments with ease.

This project was built to serve as an exemplar production-ready entry point for developers exploring the Stellar ecosystem. By utilizing Vanilla CSS styled with Tailwind and standard React hooks, it demonstrates best practices for transaction building, memo attachments, error parsing from Horizon servers, and wallet connection states.

Whether you are testing basic payment mechanics, learning Freighter browser extension integrations, or looking for a robust boilerplate to build complex Stellar-based decentralized applications, StellarPay offers a production-grade template with clean separation of concerns and robust error checking.

## Features
- Freighter wallet connect/disconnect
- Live XLM balance display on Stellar Testnet
- Testnet account funding via Friendbot
- Send XLM transactions with memo support
- Real-time transaction feedback with hash and explorer link
- Full error handling and input validation

## Tech Stack
- React + Vite
- Tailwind CSS
- @stellar/freighter-api
- stellar-sdk
- Stellar Testnet / Horizon

## Prerequisites
- Node.js v18+
- Freighter wallet browser extension: https://freighter.app
- Make sure Freighter is set to **Testnet** network

## Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/YOUR_USERNAME/stellar-pay.git
cd stellar-pay
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm run dev
```

### 4. Open in browser
Visit http://localhost:5173

### 5. Fund your testnet wallet
Click "Fund with Friendbot" in the app to get testnet XLM

## How to Use
1. Install Freighter and set it to Testnet
2. Click "Connect Wallet"
3. Fund your wallet with Friendbot if balance is 0
4. Enter a destination address and amount
5. Click "Send XLM" and approve in Freighter
6. View transaction result and hash

## Screenshots
### Wallet Connected
![Wallet Connected](screenshots/wallet-connected.png)

### Balance Displayed
![Balance](screenshots/balance.png)

### Successful Transaction
![Transaction Success](screenshots/transaction-success.png)

### Transaction Result
![Transaction Result](screenshots/transaction-result.png)

## Live Demo
Currently configured for quick deployment on Vercel or Netlify. You can deploy it using the Vercel CLI:
```bash
npm install -g vercel
vercel --prod
```

## License
MIT

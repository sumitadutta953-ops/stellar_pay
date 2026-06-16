# StellarPay 🚀

A simple Stellar payment dApp built on testnet that lets you connect your Freighter wallet, view your XLM balance, and send XLM transactions — all from the browser.

**Live Demo:** https://stellar-pay-umber.vercel.app/  
**GitHub:** https://github.com/sumitadutta953-ops/stellar_pay

---

## 📋 Project Description

StellarPay is a beginner-friendly Stellar dApp built as part of the White Belt level challenge. It demonstrates core Stellar development fundamentals:

- Connecting and disconnecting a Freighter wallet
- Fetching and displaying live XLM balance from Stellar testnet
- Sending XLM transactions on Stellar testnet
- Showing real-time transaction feedback (success/failure + transaction hash)

---

## 🛠️ Tech Stack

- **React** + **Vite**
- **Tailwind CSS**
- **@stellar/freighter-api** — wallet connection
- **@stellar/stellar-sdk** — Stellar network interactions
- **Stellar Testnet** (Horizon: https://horizon-testnet.stellar.org)

---

## ⚙️ Setup Instructions (Run Locally)

### Prerequisites

- Node.js v18+
- [Freighter Wallet](https://freighter.app/) browser extension installed
- Freighter set to **Testnet** mode

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/sumitadutta953-ops/stellar_pay.git
cd stellar_pay

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# http://localhost:5173
```

> **Fund your testnet wallet:** Visit [Stellar Friendbot](https://friendbot.stellar.org/) and enter your public key to get free testnet XLM.

---

## 🎯 Features

| Feature | Status |
|---------|--------|
| Freighter wallet connect | ✅ |
| Freighter wallet disconnect | ✅ |
| XLM balance display | ✅ |
| Send XLM on testnet | ✅ |
| Transaction hash feedback | ✅ |
| Success / failure states | ✅ |

---

## 📸 Screenshots

### 1. Landing Page (Wallet Not Connected)
![Wallet Disconnected](./src/level_1_ss/ss1.png)

### 2. Wallet Connected + Balance Displayed
![Wallet Connected](./src/level_1_ss/ss2.png)

### 3. Transaction Signing (Freighter Permission Popup)
![Transaction Signing](./src/level_1_ss/ss3.png)

### 4. Successful Transaction
![Transaction Success](./src/level_1_ss/ss4.png)

### 5. Transaction Verified on Stellar Expert
![Stellar Expert Verification](./src/level_1_ss/ss5.png)

---

## 🔗 Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Freighter Wallet](https://freighter.app/)
- [Stellar Testnet Explorer](https://stellar.expert/explorer/testnet)
- [Stellar Friendbot (Faucet)](https://friendbot.stellar.org/)

---

## 📄 License

MIT

# StellarPay 🚀 (Level 2 Yellow Belt)

A Stellar payment and smart contract dApp built on Stellar Testnet that lets you connect multiple wallets, send XLM, and read/write values to a deployed Soroban contract.

**Live Demo:** https://stellar-pay-umber.vercel.app/  
**GitHub:** https://github.com/sumitadutta953-ops/stellar_pay

---

## 📋 Project Description

StellarPay is updated to a Level 2 (Yellow Belt) dApp demonstrating core Stellar development fundamentals:

- **StellarWalletsKit Multi-Wallet Integration**: Connect via Freighter, xBull, Albedo, or Rabet.
- **Soroban Smart Contract**: Live read/write interactions with an on-chain Counter contract.
- **Advanced Error Handling**: User-facing visual alerts for:
  - *Wallet not found* (when the selected extension is not installed)
  - *User rejected* (when the signature request is cancelled)
  - *Insufficient balance* (when XLM is too low for transfer or gas fees)
- **Transaction Status Tracking**: Dynamic visual feedback states (Pending, Success, Failed) with direct links to `stellar.expert` explorer.
- **State Sync**: Contract state re-fetches and updates automatically on success without needing page refreshes.

---

## 🔑 Level 2 Submission Details

- **Deployed Contract ID:** `CANKOB2VLLLRDXYBDRMCUM754QIDGW2Y27FUHC26PLKJQ5PYTZSFIE3P`
- **Contract Call Tx Hash:** `[Your Tx Hash Here - e.g. 5ca7fa...]`

---

## 🛠️ Tech Stack

- **React** + **Vite**
- **Tailwind CSS**
- **@creit.tech/stellar-wallets-kit** — wallet abstraction
- **@stellar/stellar-sdk** — network and Soroban RPC interactions
- **Stellar Testnet** (RPC: https://soroban-testnet.stellar.org)

---

## ⚙️ Setup & Deployment Instructions

### Prerequisites
- Node.js v18+
- [Stellar CLI](https://developers.stellar.org/docs/tools/stellar-cli)
- Rust toolchain and `wasm32-unknown-unknown` target

### 1. Compile & Deploy the Smart Contract
```bash
# Move to the contracts directory
cd contracts

# Build the WASM binary
stellar contract build

# Deploy to Testnet (using target wasm32-unknown-unknown or wasm32v1-none)
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/stellar_pay_counter.wasm --source <your-key-alias> --network testnet
```
*Take note of the deployed Contract ID.*

### 2. Run the Frontend Locally
```bash
# Back to project root
cd ..
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser. Paste your new Contract ID into the **Change ID** field in the contract panel to test.

---

## 📸 Level 2 Screenshots

All screenshots are stored under `src/level_2_ss/`:

- **ss1.png**: Wallet selection modal (multiple wallets visible)
- **ss2.png**: Connected wallet details and XLM balance
- **ss3.png**: Transaction pending loading state (spinner)
- **ss4.png**: Transaction success confirmation and hash
- **ss5.png**: Active error message (e.g. User Rejected)
- **ss6.png**: Transaction verified on Stellar Expert explorer

---

## 📄 License

MIT


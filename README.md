# StellarPay — Complete Stellar dApp (Level 1 & 2)

A production-ready, multi-wallet payment and smart contract dApp on the **Stellar Blockchain**. StellarPay enables users to send XLM instantly, interact with deployed Soroban smart contracts, and monitor real-time transaction events on Stellar Testnet.

---

## 🌟 Project Overview

**StellarPay** is a two-level Stellar development project demonstrating blockchain fundamentals and advanced smart contract interactions:

### **Level 1: White Belt — Payment Fundamentals**
A simple, working payment dApp that teaches core Stellar concepts: wallet integration, balance management, and XLM transactions on testnet. Perfect for understanding blockchain basics.

### **Level 2: Orange Belt — Smart Contracts & Multi-Wallet**
An advanced payment system with multi-wallet support, Soroban smart contract deployment, real-time contract interactions, and comprehensive error handling. Demonstrates production-grade dApp architecture.

Together, these levels showcase a complete journey from simple transactions to decentralized smart contract applications.

---

## ✨ Features

### Level 1 Features
- ✅ **Freighter Wallet Integration** — Connect and manage your Stellar wallet securely
- ✅ **Live XLM Balance Display** — Real-time balance fetching from Horizon API
- ✅ **Send XLM Transactions** — Simple, intuitive payment form with validation
- ✅ **Transaction Feedback** — Success/failure states with transaction hash and explorer link
- ✅ **Testnet Funding** — Friendbot integration for quick testnet XLM (100 XLM per account)
- ✅ **Input Validation** — Address validation, amount checks, balance verification
- ✅ **Dark Theme UI** — Modern, professional design with Stellar branding

### Level 2 Features
- ✅ **Multi-Wallet Support** — Connect using multiple wallet providers (Freighter, Albedo, etc.)
- ✅ **Soroban Smart Contract** — Custom-deployed contract on Stellar Testnet
- ✅ **Contract Interactions** — Call smart contract functions directly from the UI
- ✅ **Real-Time Event Listening** — Monitor contract events and state changes
- ✅ **Transaction Status Tracking** — Pending → Success/Failure states with visual feedback
- ✅ **Error Handling** — 3+ error types (User Rejected, Insufficient Balance, Network Errors)
- ✅ **Activity Log** — View all transactions and contract interactions in real-time
- ✅ **Network Stats** — Display Stellar network metrics (gas fees, ledger close time, etc.)

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|-----------|
| **Frontend** | React 18 + Vite |
| **Styling** | Tailwind CSS + Custom Dark Theme |
| **Wallet Integration** | @stellar/freighter-api, StellarWalletsKit |
| **Blockchain SDK** | stellar-sdk (v12+) |
| **Smart Contract** | Rust (Soroban) |
| **Deployment** | Vercel (Frontend), Stellar Testnet (Contract) |
| **State Management** | React Hooks (useState, useEffect, useContext) |

---

## 📋 Prerequisites

### Required
- **Node.js v18+** — [Download here](https://nodejs.org/)
- **Freighter Wallet** — [Install extension](https://freighter.app)
- **Freighter set to Testnet** — Open extension → Settings → Network → Select "Testnet"
- **Git** — For cloning the repository

### Optional (Level 2)
- **Stellar CLI** — For local contract testing
- **Rust** — For modifying the smart contract

---

## 🚀 Setup Instructions

### Step 1: Clone the Repository
```bash
git clone https://github.com/sumitadutta953-ops/stellar_pay.git
cd stellar_pay
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
```bash
cp .env.example .env.local
```

Configure if needed (most settings have defaults for Testnet):
```env
VITE_STELLAR_NETWORK=testnet
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_CONTRACT_ID=CANKOB2VLLLRDXYBDRMCUM754QIDGW2Y27FUHC26PLKJQ5PYTZSFIE3P
```

### Step 4: Start Development Server
```bash
npm run dev
```

Visit **http://localhost:5173** in your browser.

### Step 5: Fund Your Testnet Wallet
1. Click **"Fund with Friendbot"** button in the app
2. Receive 100 XLM instantly
3. Balance updates automatically

### Step 6: Send Your First Transaction (Level 1)
1. Enter any valid Stellar address (e.g., another testnet account)
2. Enter amount in XLM
3. (Optional) Add a memo
4. Click **"Send XLM"**
5. Approve in your wallet
6. View transaction hash and explorer link

### Step 7: Call Smart Contract (Level 2)
1. Navigate to **"Contract Panel"**
2. Select a contract function from the dropdown
3. Enter any required parameters
4. Click **"Execute"**
5. Monitor real-time status updates
6. View transaction on Stellar Expert

---

## 📸 Screenshots

All screenshots are located in `src/level_2_ss/` directory:

### Level 1 Screenshots
| # | Name | Description |
|---|------|-------------|
| 1 | `ss1.png` | **Wallet Selection Modal** — Multiple wallet options visible (Freighter, Albedo, etc.) |
| 2 | `ss2.png` | **Connected Wallet** — Displays wallet address, TESTNET badge, and XLM balance |

### Level 2 Screenshots
| # | Name | Description |
|---|------|-------------|
| 3 | `ss3.png` | **Pending Transaction State** — Loading spinner and "Sending transaction..." message |
| 4 | `ss4.png` | **Success Confirmation** — Green banner, transaction hash, and explorer link |
| 5 | `ss5.png` | **Error Handling** — Shows "User Rejected" or "Insufficient Balance" error messages |
| 6 | `ss6.png` | **Explorer Verification** — Transaction verified on Stellar Expert testnet explorer |

---

## 🔗 Live Demo

**Deployed Application:** [stellar-pay-umber.vercel.app](https://stellar-pay-umber.vercel.app/)

Connected to **Stellar Testnet** — Safe to test with testnet funds.

---

## 🔐 Smart Contract Details

### Deployed Contract
- **Contract ID:** `CANKOB2VLLLRDXYBDRMCUM754QIDGW2Y27FUHC26PLKJQ5PYTZSFIE3P`
- **Network:** Stellar Testnet
- **Language:** Rust (Soroban)
- **Contract Type:** Payment & State Management

### Contract Functions
```rust
// Example: Increment counter
pub fn increment(&mut self) -> u32

// Deployed on Testnet, callable from frontend
```

### Verified Transaction
**Sample Contract Call Transaction:**
- **Hash:** `2a0696f1e223aae3be9e5907f5b4ff716691d6dabc330421236d7de2e9a46c21`
- **Function Called:** `increment`
- **Status:** ✅ Success
- **Explorer Link:** [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/2a0696f1e223aae3be9e5907f5b4ff716691d6dabc330421236d7de2e9a46c21)

---

## 🏗️ Project Structure

```
stellar_pay/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.jsx              # Navigation header
│   │   ├── WalletCard.jsx          # Wallet status & balance
│   │   ├── SendForm.jsx            # XLM transfer form
│   │   ├── ContractPanel.jsx       # Smart contract interaction
│   │   ├── TransactionConfirmModal.jsx  # Pre-submission confirmation
│   │   ├── TransactionResult.jsx   # Success/failure feedback
│   │   ├── ActivityLog.jsx         # Transaction history
│   │   └── NetworkStats.jsx        # Stellar network metrics
│   │
│   ├── hooks/
│   │   ├── useWallet.js            # Wallet connection logic
│   │   └── useTransaction.js       # Transaction building & submission
│   │
│   ├── utils/
│   │   ├── stellar.js              # Horizon API, balance fetch
│   │   ├── validation.js           # Address & amount validators
│   │   └── contractUtils.js        # Contract interaction helpers
│   │
│   ├── level_2_ss/
│   │   ├── ss1.png                 # Wallet selection modal
│   │   ├── ss2.png                 # Connected wallet & balance
│   │   ├── ss3.png                 # Pending transaction state
│   │   ├── ss4.png                 # Success confirmation
│   │   ├── ss5.png                 # Error handling example
│   │   └── ss6.png                 # Stellar Expert verification
│   │
│   ├── contracts/
│   │   └── src/
│   │       └── lib.rs              # Soroban smart contract (Rust)
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── scripts/
│   ├── decode_contracts.cjs
│   ├── get_latest_contracts.cjs
│   ├── find_active_contract.cjs
│   └── (contract management utilities)
│
├── .env.example
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md (this file)
```

---

## 🔧 How to Use

### Level 1: Send XLM
1. **Connect Wallet** → Click "Connect Wallet" button
2. **View Balance** → Your XLM balance displays automatically
3. **Fund Account** → Click "Fund with Friendbot" if balance is 0
4. **Send Payment** → Enter recipient address and amount
5. **Approve** → Sign transaction in Freighter
6. **Confirm** → See success/failure feedback with tx hash

### Level 2: Interact with Smart Contract
1. **Connect Multi-Wallet** → Select your preferred wallet provider
2. **Navigate to Contract Panel** → Tab at top of app
3. **Select Function** → Choose a contract function from dropdown
4. **Enter Parameters** → Input any required arguments
5. **Execute** → Click "Execute" button
6. **Monitor Status** → Watch pending → success/failure transition
7. **View Event** → New entry appears in Activity Log

### Level 2: Error Handling Examples
- **User Rejected:** Wallet popup denied → Red error banner shown
- **Insufficient Balance:** Amount > current balance → Form validation prevents submission
- **Network Error:** Horizon API down → Helpful error message displayed

---

## 🧪 Testing

### Test Accounts
Create free testnet accounts at:
- [Stellar Testnet Dashboard](https://stellar.org/ecosystem/use-cases/stellar-testnet)
- [Friendbot (via app)](https://stellar-pay-umber.vercel.app/)

### Sample Test Transactions
```
Recipient: GARSOD5ZZWFNQFZ4BNVMSFK4I4PQS7H6SLPMXNXCHGZ7DGFN37IXYFV
Amount: 5 XLM
Memo: "Test Payment"
```

### Verify on Explorer
All transactions verified on [Stellar Expert Testnet Explorer](https://stellar.expert/explorer/testnet)

---

## 🚨 Error Handling

StellarPay implements comprehensive error handling for:

### Level 1 Errors
- ❌ **Freighter Not Installed** → Installation prompt with link
- ❌ **Invalid Address** → Real-time validation error
- ❌ **Insufficient Balance** → Amount validation before submit
- ❌ **Network Errors** → User-friendly Horizon API error messages

### Level 2 Errors
- ❌ **User Rejected** → "Transaction cancelled by user"
- ❌ **Contract Call Failed** → Detailed error from contract
- ❌ **Wallet Not Found** → "Connect a wallet first"
- ❌ **Insufficient Balance** → "Your balance is too low"

---

## 📝 Git Commits

This project includes **2+ meaningful commits**:

1. **Initial Level 1 Setup** — Wallet integration, balance fetch, XLM transactions
2. **Level 2 Implementation** — Multi-wallet support, Soroban contract, event listening
3. **Bug Fixes & Polish** — Error handling refinements, UI improvements

View commit history:
```bash
git log --oneline
```

---

## 🌐 Deployment

### Frontend (Vercel)
```bash
npm run build
# Preview: npm run preview
# Deploy: vercel --prod
```

**Live:** [stellar-pay-umber.vercel.app](https://stellar-pay-umber.vercel.app/)

### Smart Contract (Stellar Testnet)
Contract already deployed at:
```
CANKOB2VLLLRDXYBDRMCUM754QIDGW2Y27FUHC26PLKJQ5PYTZSFIE3P
```

To redeploy your own contract:
```bash
cd contracts
soroban contract build
soroban contract deploy --network testnet
```

---

## 📚 Learning Resources

### Stellar Documentation
- [Stellar Developers](https://developers.stellar.org/)
- [Horizon API Docs](https://developers.stellar.org/api/introduction/)
- [Soroban Docs](https://soroban.stellar.org/)

### Freighter Wallet
- [Freighter API](https://github.com/stellar/freighter)
- [Browser Extension](https://freighter.app)

### Testnet Tools
- [Stellar Expert Explorer](https://stellar.expert/explorer/testnet)
- [Friendbot Faucet](https://friendbot.stellar.org/)

---

## 🤝 Contributing

Found a bug or have a feature request? Open an issue on GitHub!

```bash
git checkout -b feature/your-feature
git commit -m "Add your feature"
git push origin feature/your-feature
```

---

## 📄 License

MIT License — Feel free to use this project for learning and development.

---

## 🎓 Stellar Certification

This project completes:
- ✅ **Level 1: White Belt** — Payment fundamentals
- ✅ **Level 2: Orange Belt** — Smart contracts & multi-wallet

**Built by:** [Sumit Adutta](https://github.com/sumitadutta953-ops)  
**Date:** June 2025  
**Network:** Stellar Testnet  
**Status:** 🟢 Production Ready

---

## 📞 Support

Need help?
1. Check [Stellar Discord](https://discord.gg/stellardev)
2. Review [GitHub Issues](https://github.com/sumitadutta953-ops/stellar_pay/issues)
3. Read Stellar [Developer Docs](https://developers.stellar.org/)

---

**Happy Building on Stellar! 🚀⭐**

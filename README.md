# StellarPay Pro 🚀 — Level 3 Orange Belt

An enterprise-grade, production-ready Stellar payment dApp built for the **Orange Belt** level challenge. StellarPay Pro demonstrates advanced Soroban smart contract development, real-time event streaming, TypeScript architecture, automated CI/CD, and comprehensive testing.

**Live Demo:** https://stellar-pay-umber.vercel.app/  
**GitHub:** https://github.com/sumitadutta953-ops/stellar_pay

---

## 📋 Project Overview

StellarPay Pro is a sophisticated payment platform on Stellar Testnet that showcases production-grade development practices:

- **2 Soroban smart contracts** with inter-contract communication
- **Real-time event streaming** from on-chain contract events
- **TypeScript strict mode** throughout the entire frontend
- **Zustand** for scalable state management
- **TanStack Query** for data fetching and cache management
- **Vitest** test suite with 25+ test cases
- **GitHub Actions** CI/CD pipeline with 5 automated jobs
- **Mobile-first** responsive design across 3 breakpoints
- **10+ conventional commits** with atomic, focused changes

---

## ✨ Features

### Level 3 Features
| Feature | Implementation |
|---|---|
| PaymentHub contract | Rust/Soroban, payment history, events |
| PaymentValidator contract | Rust/Soroban, inter-contract validation |
| Inter-contract communication | PaymentHub calls PaymentValidator |
| Real-time event streaming | Polls Soroban RPC every 5 seconds |
| TypeScript strict mode | `strict: true`, `noImplicitAny`, `strictNullChecks` |
| Zustand state management | 4 stores: wallet, payments, contracts, UI |
| TanStack Query | Queries + mutations with cache invalidation |
| Vitest tests | 25+ tests across utils, stores, integration |
| GitHub Actions CI/CD | 5 jobs: contract tests, frontend tests, build, deploy, security |
| Mobile-first responsive UI | 320px → 768px → 1024px breakpoints |
| ErrorBoundary | React class component with fallback UI |
| Toast notifications | 4 types: success, error, warning, info |
| Loading skeletons | Skeleton + spinner components |

### Inherited from Level 2
| Feature | Status |
|---|---|
| Multi-wallet support (Freighter + Demo) | ✅ |
| Counter contract (increment/decrement) | ✅ |
| Transaction status visible | ✅ |
| 3+ error types handled | ✅ |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     StellarPay Pro                          │
│                                                             │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  React   │    │   Zustand    │    │  TanStack Query  │  │
│  │  18 +    │◄──►│  4 Stores    │    │  Queries +       │  │
│  │TypeScript│    │  (wallet,    │    │  Mutations       │  │
│  │          │    │  payments,   │    │                  │  │
│  │          │    │  contracts,  │    └────────┬─────────┘  │
│  │          │    │  ui)         │             │            │
│  └────┬─────┘    └──────────────┘             │            │
│       │                                        │            │
│  ┌────▼──────────────────────────────────────▼──────────┐  │
│  │               Service Layer                          │  │
│  │  stellar.ts │ contractService.ts │ eventService.ts   │  │
│  └────┬──────────────────────────────────────┬──────────┘  │
│       │                                       │             │
└───────┼───────────────────────────────────────┼─────────────┘
        │                                       │
        ▼                                       ▼
┌───────────────┐                   ┌───────────────────────┐
│ Stellar       │                   │ Soroban RPC           │
│ Horizon       │                   │ (soroban-testnet)     │
│ (testnet)     │                   │                       │
└───────────────┘                   └───────┬───────────────┘
                                            │
                              ┌─────────────┼─────────────────┐
                              │             │                 │
                     ┌────────▼──┐  ┌───────▼──────┐         │
                     │ Counter   │  │ PaymentHub   │         │
                     │ Contract  │  │ Contract     │         │
                     │ (Level 2) │  │              │         │
                     └───────────┘  └──────┬───────┘         │
                                           │ inter-contract  │
                                    ┌──────▼───────┐         │
                                    │ Payment      │         │
                                    │ Validator    │         │
                                    └──────────────┘         │
```

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite 5 + TypeScript 5 (strict mode)
- Tailwind CSS 3 (mobile-first responsive)
- Zustand 4 (state management)
- TanStack Query 5 (data fetching)
- Vitest 2 + Testing Library (tests)

**Smart Contracts**
- Rust (Soroban SDK 21.6.0)
- PaymentHub contract — payment history, events
- PaymentValidator contract — validation rules
- Counter contract (Level 2) — increment/decrement

**DevOps**
- GitHub Actions (5-job CI/CD pipeline)
- Vercel (automated production deployment)
- npm audit (security scanning)

---

## ⚙️ Setup Instructions

### Prerequisites
- Node.js v18+
- Rust + Cargo (for contract development)
- [Freighter Wallet](https://freighter.app/) browser extension (optional — demo mode available)

### 1. Clone the repository
```bash
git clone https://github.com/sumitadutta953-ops/stellar_pay.git
cd stellar_pay
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Configure environment variables
```bash
cp .env.example .env
# Edit .env and fill in contract IDs if you deploy new contracts
```

### 4. Run the development server
```bash
npm run dev
# Open http://localhost:5173
```

### 5. Run tests
```bash
npm test                  # Run all tests
npm run test:coverage     # With coverage report
```

---

## 🦀 Smart Contract Deployment

### PaymentHub Contract
```bash
cd contracts/payment-hub

# Build
cargo build --target wasm32-unknown-unknown --release

# Deploy (requires Stellar CLI)
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/payment_hub.wasm \
  --source <YOUR_ACCOUNT> \
  --network testnet
```

### PaymentValidator Contract
```bash
cd contracts/payment-validator

# Build
cargo build --target wasm32-unknown-unknown --release

# Deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/payment_validator.wasm \
  --source <YOUR_ACCOUNT> \
  --network testnet
```

### Run Contract Tests
```bash
cd contracts/payment-hub
cargo test --verbose

cd ../payment-validator
cargo test --verbose
```

---

## 🧪 Testing

### Test Coverage
| Suite | File | Tests |
|---|---|---|
| Validation Utils | PaymentForm.test.tsx | 12 tests |
| Formatting Utils | WalletConnect.test.tsx | 8 tests |
| Wallet Store | useWallet.test.ts | 7 tests |
| Integration | payment-flow.test.ts | 8 tests |
| **Total** | | **35 tests** |

### Run Tests
```bash
npm test                  # All tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

### Rust Contract Tests (15 tests)
```bash
cd contracts/payment-hub && cargo test      # 8 tests
cd contracts/payment-validator && cargo test  # 7 tests
```

---

## 🔁 CI/CD Pipeline (GitHub Actions)

The pipeline runs on every push to `main` or `develop`:

```
┌─────────────────────────────────────────────────────┐
│              GitHub Actions Pipeline                │
│                                                     │
│  Push/PR → main                                     │
│       │                                             │
│       ├── 🦀 contract-tests (cargo test)            │
│       │       PaymentHub: 8 tests                   │
│       │       PaymentValidator: 7 tests              │
│       │                                             │
│       ├── ⚛️  frontend-tests (vitest)               │
│       │       35 JS/TS tests                        │
│       │       ESLint + Prettier check               │
│       │                                             │
│       ├── 🏗️  build (vite build)                    │
│       │       TypeScript compile + bundle           │
│       │                                             │
│       ├── 🚀 deploy (Vercel, main only)             │
│       │       Automated production deploy           │
│       │                                             │
│       └── 🔒 security (npm audit)                  │
│               Scans for high-severity vulns         │
└─────────────────────────────────────────────────────┘
```

### Required GitHub Secrets
Add these in **Settings → Secrets → Actions**:
- `VERCEL_TOKEN` — your Vercel API token
- `VERCEL_ORG_ID` — your Vercel organization ID
- `VERCEL_PROJECT_ID` — your Vercel project ID

---

## 📡 API Documentation

### PaymentHub Contract

| Function | Args | Returns | Description |
|---|---|---|---|
| `send_payment` | `sender: Address, recipient: Address, amount: i128, memo: String` | `()` | Send a payment, record it, emit event |
| `get_payment_history` | `—` | `Vec<PaymentRecord>` | Last 50 payments |
| `get_total_sent` | `user: Address` | `i128` | Total stroops sent by user |
| `get_payment_count` | `user: Address` | `u32` | Number of payments made |

### PaymentValidator Contract

| Function | Args | Returns | Description |
|---|---|---|---|
| `validate_payment` | `amount: i128, recipient: Address, memo: String` | `bool` | Validates payment rules |
| `set_max_payment_limit` | `caller: Address, limit: i128` | `()` | Admin: set max limit |
| `get_payment_limit` | `—` | `i128` | Current payment limit |

### Events Emitted

| Event | Contract | Data |
|---|---|---|
| `PayRecvd` | PaymentHub | `(recipient, amount, timestamp)` |
| `PayFailed` | PaymentHub | `(recipient, reason)` |
| `LimitOver` | PaymentHub | `(amount, limit)` |
| `Validated` | PaymentValidator | `(is_valid, reason)` |
| `LimitOver` | PaymentValidator | `(amount, limit)` |

---

## 🔗 Deployed Contracts

| Contract | Address | Network |
|---|---|---|
| Counter (Level 2) | `CANKOB2VLLLRDXYBDRMCUM754QIDGW2Y27FUHC26PLKJQ5PYTZSFIE3P` | Stellar Testnet |
| PaymentHub | *Deploy and add here* | Stellar Testnet |
| PaymentValidator | *Deploy and add here* | Stellar Testnet |

**Verified transaction (counter increment):**  
`2a0696f1e223aae3be9e5907f5b4ff716691d6dabc330421236d7de2e9a46c21`  
[View on Stellar Expert ↗](https://stellar.expert/explorer/testnet/tx/2a0696f1e223aae3be9e5907f5b4ff716691d6dabc330421236d7de2e9a46c21)

---

## 🖥️ Screenshots

| Screenshot | Description |
|---|---|
| ss1–ss2 | Wallet connection & balance display |
| ss3 | On-chain counter state |
| ss4 | Transaction loading state (spinner) |
| ss5 | Transaction success + hash |
| ss6 | Error: User rejected |

Screenshots located in `src/level_1_ss/` and `src/level_2_ss/`.

---

## 🔧 Troubleshooting

**Freighter not detected**  
Install the [Freighter browser extension](https://freighter.app/) and set it to Testnet mode. Or use Demo Mode (no extension needed).

**Account not found on testnet**  
Click the 🚰 Friendbot button in the wallet panel to fund your account with 10,000 XLM.

**Contract call fails (simulation error)**  
The counter contract state may have expired (Soroban TTL). The contract auto-extends TTL on each call.

**npm install fails**  
Use `cmd /c npm install` on Windows if PowerShell execution policy blocks npm.

**TypeScript errors in VS Code**  
Ensure `tsconfig.json` is at the project root and your VS Code TypeScript version is 5.0+.

---

## 📄 License

MIT

---

## 👤 Author

Built as part of the Stellar Developer Belt Challenge — Level 3 Orange Belt submission.

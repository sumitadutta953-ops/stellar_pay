export const HORIZON_URL =
  import.meta.env.VITE_HORIZON_URL ?? 'https://horizon-testnet.stellar.org';

export const SOROBAN_RPC_URL =
  import.meta.env.VITE_SOROBAN_RPC_URL ?? 'https://soroban-testnet.stellar.org';

export const NETWORK_PASSPHRASE =
  import.meta.env.VITE_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015';

export const PAYMENT_HUB_CONTRACT_ID =
  import.meta.env.VITE_PAYMENT_HUB_CONTRACT_ID ?? '';

export const PAYMENT_VALIDATOR_CONTRACT_ID =
  import.meta.env.VITE_PAYMENT_VALIDATOR_CONTRACT_ID ?? '';

export const COUNTER_CONTRACT_ID =
  import.meta.env.VITE_COUNTER_CONTRACT_ID ??
  'CANKOB2VLLLRDXYBDRMCUM754QIDGW2Y27FUHC26PLKJQ5PYTZSFIE3P';

export const MAX_PAYMENT_XLM = 10_000;
export const MAX_MEMO_LENGTH = 28;
export const STROOP_PER_XLM = 10_000_000;
export const EVENT_POLL_INTERVAL_MS = 5_000;
export const MAX_HISTORY_ITEMS = 50;

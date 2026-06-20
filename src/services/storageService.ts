/** Typed localStorage wrapper */
export const storageService = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return fallback;
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage quota exceeded — silently ignore */
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },
};

export const STORAGE_KEYS = {
  WALLET_ADDRESS: 'sp_wallet_address',
  IS_DEMO_MODE: 'sp_demo_mode',
  CONTRACT_HUB_ID: 'sp_hub_contract_id',
  CONTRACT_VALIDATOR_ID: 'sp_validator_contract_id',
} as const;

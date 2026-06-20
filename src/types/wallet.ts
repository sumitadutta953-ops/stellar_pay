export interface Wallet {
  address: string;
  balance: string;
  isConnected: boolean;
  isDemoMode: boolean;
}

export type WalletType = 'freighter' | 'demo' | 'none';

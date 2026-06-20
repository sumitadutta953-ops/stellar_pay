import { create } from 'zustand';
import { storageService, STORAGE_KEYS } from '@/services/storageService';

interface WalletState {
  address: string | null;
  balance: string;
  isConnected: boolean;
  isDemoMode: boolean;
  isLoading: boolean;
  error: string | null;
  setWallet: (address: string, balance: string, isDemoMode?: boolean) => void;
  setBalance: (balance: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>(set => ({
  address: storageService.get<string | null>(STORAGE_KEYS.WALLET_ADDRESS, null),
  balance: '0',
  isConnected: false,
  isDemoMode: storageService.get<boolean>(STORAGE_KEYS.IS_DEMO_MODE, false),
  isLoading: false,
  error: null,

  setWallet: (address, balance, isDemoMode = false) => {
    storageService.set(STORAGE_KEYS.WALLET_ADDRESS, address);
    storageService.set(STORAGE_KEYS.IS_DEMO_MODE, isDemoMode);
    set({ address, balance, isConnected: true, isDemoMode, error: null });
  },

  setBalance: balance => set({ balance }),
  setLoading: isLoading => set({ isLoading }),
  setError: error => set({ error }),

  disconnect: () => {
    storageService.remove(STORAGE_KEYS.WALLET_ADDRESS);
    storageService.remove(STORAGE_KEYS.IS_DEMO_MODE);
    set({ address: null, balance: '0', isConnected: false, isDemoMode: false, error: null });
  },
}));

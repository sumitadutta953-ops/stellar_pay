import { useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useWalletStore } from '@/store/walletStore';
import { getXlmBalance, loadAccount } from '@/services/stellar';
import { parseTransactionError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import { showToast } from '@/services/notificationService';

declare global {
  interface Window {
    freighter?: {
      isConnected: () => Promise<boolean>;
      getPublicKey: () => Promise<string>;
      signTransaction: (xdr: string, opts: { networkPassphrase: string }) => Promise<string>;
    };
  }
}

export function useWallet() {
  const store = useWalletStore();

  const isInstalled = typeof window !== 'undefined' && !!window.freighter;

  const connectWallet = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);
    try {
      if (!window.freighter) throw new Error('Freighter not installed');
      const publicKey = await window.freighter.getPublicKey();
      const balance = await getXlmBalance(publicKey);
      store.setWallet(publicKey, balance, false);
      showToast('Wallet connected!', 'success');
    } catch (err) {
      const parsed = parseTransactionError(err);
      store.setError(parsed.message);
      showToast(parsed.message, 'error');
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const connectDemoWallet = useCallback(async () => {
    store.setLoading(true);
    try {
      const keypair = StellarSdk.Keypair.random();
      store.setWallet(keypair.publicKey(), '10000.0000000', true);
      showToast('Demo wallet connected!', 'info');
    } finally {
      store.setLoading(false);
    }
  }, [store]);

  const disconnectWallet = useCallback(() => {
    store.disconnect();
    showToast('Wallet disconnected', 'info');
  }, [store]);

  const refreshBalance = useCallback(
    async (publicKey: string) => {
      try {
        const balance = await getXlmBalance(publicKey);
        store.setBalance(balance);
      } catch (err) {
        logger.warn('Could not refresh balance', err);
      }
    },
    [store]
  );

  const fundAccount = useCallback(async (publicKey: string) => {
    try {
      const res = await fetch(`https://friendbot.stellar.org/?addr=${publicKey}`);
      if (!res.ok) throw new Error('Friendbot failed');
      showToast('Account funded with 10,000 XLM!', 'success');
      await new Promise(r => setTimeout(r, 2000));
      const balance = await getXlmBalance(publicKey);
      store.setBalance(balance);
    } catch (err) {
      const parsed = parseTransactionError(err);
      showToast(parsed.message, 'error');
    }
  }, [store]);

  const signTx = useCallback(
    async (xdr: string): Promise<string> => {
      if (store.isDemoMode) {
        // Demo mode: find the keypair from the stored address (not real — return the XDR as-is)
        // In a real demo we'd store the keypair; for now just throw to indicate demo limit
        throw new Error('User rejected: Demo mode cannot sign real transactions');
      }
      if (!window.freighter) throw new Error('Freighter not available');
      return window.freighter.signTransaction(xdr, {
        networkPassphrase: 'Test SDF Network ; September 2015',
      });
    },
    [store.isDemoMode]
  );

  // Verify Freighter is actually connected (not just installed)
  const verifyConnection = useCallback(async () => {
    if (!window.freighter) return false;
    try {
      return await window.freighter.isConnected();
    } catch {
      return false;
    }
  }, []);

  return {
    publicKey: store.address,
    balance: store.balance,
    isConnected: store.isConnected,
    isDemoMode: store.isDemoMode,
    isInstalled,
    loading: store.isLoading,
    error: store.error,
    connectWallet,
    connectDemoWallet,
    disconnectWallet,
    refreshBalance,
    fundAccount,
    signTx,
    verifyConnection,
    // expose account loader for components that need full account
    loadAccount,
  };
}

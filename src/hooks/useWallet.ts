import { useCallback, useEffect, useState } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { isConnected as checkIsConnected, getAddress as getFreighterAddress, signTransaction as signFreighterTransaction } from '@stellar/freighter-api';
import { useWalletStore } from '@/store/walletStore';
import { getXlmBalance, loadAccount } from '@/services/stellar';
import { parseTransactionError } from '@/utils/errorHandler';
import { logger } from '@/utils/logger';
import { showToast } from '@/services/notificationService';

export function useWallet() {
  const store = useWalletStore();
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  useEffect(() => {
    // Check if Freighter is installed on mount
    checkIsConnected().then(res => {
      setIsInstalled(res.isConnected);
    }).catch(() => setIsInstalled(false));
  }, []);

  const connectWallet = useCallback(async () => {
    store.setLoading(true);
    store.setError(null);
    try {
      const connRes = await checkIsConnected();
      if (!connRes.isConnected) throw new Error('Freighter not installed or not available');
      
      const addrRes = await getFreighterAddress();
      if (addrRes.error) throw new Error(addrRes.error as string);
      
      const publicKey = addrRes.address;
      if (!publicKey) throw new Error('Failed to get public key from Freighter');
      
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

  const fundAccount = useCallback(
    async (publicKey: string) => {
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
    },
    [store]
  );

  const signTx = useCallback(
    async (xdr: string): Promise<string> => {
      if (store.isDemoMode) {
        throw new Error('User rejected: Demo mode cannot sign real transactions');
      }
      
      const connRes = await checkIsConnected();
      if (!connRes.isConnected) throw new Error('Freighter not available');
      
      const res = await signFreighterTransaction(xdr, {
        networkPassphrase: 'Test SDF Network ; September 2015',
      });
      
      if (res.error) {
        throw new Error(res.error as string);
      }
      
      return res.signedTxXdr;
    },
    [store.isDemoMode]
  );

  const verifyConnection = useCallback(async () => {
    try {
      const res = await checkIsConnected();
      return res.isConnected;
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
    loadAccount,
  };
}

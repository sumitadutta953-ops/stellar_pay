import { useState, useEffect, useCallback } from 'react';
import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api';
import { fetchXlmBalance, fundWithFriendbot, getHorizonServer } from '../utils/stellar';
import * as StellarSdk from 'stellar-sdk';

export const useWallet = () => {
  const [publicKey, setPublicKey] = useState(() => {
    const stored = localStorage.getItem('stellar_pay_pubkey');
    return (stored && stored !== "[object Object]") ? stored : null;
  });
  const [demoSecretKey, setDemoSecretKey] = useState(() => {
    return localStorage.getItem('stellar_pay_demosecret') || null;
  });
  const [isDemoMode, setIsDemoMode] = useState(() => {
    return localStorage.getItem('stellar_pay_isdemo') === 'true';
  });
  const [balance, setBalance] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const refreshActivity = useCallback(async (pubKey) => {
    const key = pubKey || publicKey;
    if (!key) return;
    setActivityLoading(true);
    try {
      const server = getHorizonServer();
      const paymentsResponse = await server.payments().forAccount(key).limit(5).order("desc").call();
      
      const formatted = paymentsResponse.records.map(r => {
        const isPayment = r.type === "payment";
        const isCreate = r.type === "create_account";
        
        let amount = "0";
        let asset = "XLM";
        let typeLabel = "Interaction";
        let typeCode = "other";
        
        if (isPayment) {
          amount = r.amount;
          asset = r.asset_type === "native" ? "XLM" : r.asset_code;
          typeLabel = r.to === key ? "Receive" : "Send";
          typeCode = r.to === key ? "receive" : "send";
        } else if (isCreate) {
          amount = r.starting_balance;
          typeLabel = r.account === key ? "Account Funded" : "Create Account";
          typeCode = r.account === key ? "receive" : "send";
        }
        
        return {
          id: r.id,
          type: typeLabel,
          typeCode: typeCode,
          amount: amount,
          asset: asset,
          from: r.from || r.funder || "",
          to: r.to || r.account || "",
          hash: r.transaction_hash,
          createdAt: r.created_at,
        };
      });
      setActivity(formatted);
    } catch (err) {
      console.error("Failed to fetch activity:", err);
    } finally {
      setActivityLoading(false);
    }
  }, [publicKey]);

  const refreshBalance = useCallback(async (pubKey) => {
    const key = pubKey || publicKey;
    if (!key) return;
    setLoading(true);
    setError(null);
    try {
      const bal = await fetchXlmBalance(key);
      setBalance(bal);
      refreshActivity(key);
    } catch (err) {
      setBalance(null);
      if (err.message && err.message.includes("Account not funded yet")) {
        setError("Account not funded yet — use Friendbot");
      } else {
        setError(err.message || "Failed to fetch balance");
      }
    } finally {
      setLoading(false);
    }
  }, [publicKey, refreshActivity]);

  // Check if Freighter is installed
  useEffect(() => {
    const checkFreighter = async () => {
      try {
        const connected = await isConnected();
        setIsInstalled(!!connected);
      } catch (err) {
        setIsInstalled(false);
      }
    };
    checkFreighter();
  }, []);

  // Sync public key/demo state to localStorage
  useEffect(() => {
    if (publicKey) {
      localStorage.setItem('stellar_pay_pubkey', publicKey);
    } else {
      localStorage.removeItem('stellar_pay_pubkey');
    }
  }, [publicKey]);

  useEffect(() => {
    if (demoSecretKey) {
      localStorage.setItem('stellar_pay_demosecret', demoSecretKey);
    } else {
      localStorage.removeItem('stellar_pay_demosecret');
    }
  }, [demoSecretKey]);

  useEffect(() => {
    localStorage.setItem('stellar_pay_isdemo', isDemoMode.toString());
  }, [isDemoMode]);

  // Load balance on mount or key change
  useEffect(() => {
    if (publicKey) {
      refreshBalance(publicKey);
    }
  }, [publicKey, refreshBalance]);

  const connectWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const isConnectedWallet = await isConnected();
      if (!isConnectedWallet) {
        throw new Error("Freighter wallet is not installed.");
      }
      
      // Request access
      const accessResult = await requestAccess();
      if (accessResult && accessResult.error) {
        throw new Error(accessResult.error.message || accessResult.error);
      }
      
      const addrResult = await getAddress();
      if (addrResult && addrResult.error) {
        throw new Error(addrResult.error.message || addrResult.error);
      }
      
      const pubKey = typeof addrResult === 'string' ? addrResult : (addrResult.address || addrResult);
      if (!pubKey || typeof pubKey !== 'string') {
        throw new Error("Could not retrieve public key. Please unlock Freighter.");
      }
      
      setIsDemoMode(false);
      setDemoSecretKey(null);
      setPublicKey(pubKey);
      await refreshBalance(pubKey);
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
      setPublicKey(null);
      setBalance(null);
    } finally {
      setLoading(false);
    }
  };

  const connectDemoWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      // Generate keypair
      const keypair = StellarSdk.Keypair.random();
      const pubKey = keypair.publicKey();
      const secretKey = keypair.secret();
      
      setIsDemoMode(true);
      setDemoSecretKey(secretKey);
      setPublicKey(pubKey);
      
      // Request Friendbot funding automatically
      try {
        await fundWithFriendbot(pubKey);
        await refreshBalance(pubKey);
      } catch (fundErr) {
        // Even if automatic friendbot fails initially, show account setup so they can retry manually
        setError("Wallet generated. Friendbot funding failed, please click 'Fund Account' to retry.");
      }
    } catch (err) {
      setError(err.message || "Failed to generate Demo wallet");
      setPublicKey(null);
      setBalance(null);
      setIsDemoMode(false);
      setDemoSecretKey(null);
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = () => {
    setPublicKey(null);
    setDemoSecretKey(null);
    setIsDemoMode(false);
    setBalance(null);
    setError(null);
    localStorage.removeItem('stellar_pay_pubkey');
    localStorage.removeItem('stellar_pay_demosecret');
    localStorage.setItem('stellar_pay_isdemo', 'false');
  };

  const fundAccount = async () => {
    if (!publicKey) return;
    setLoading(true);
    setError(null);
    try {
      await fundWithFriendbot(publicKey);
      await refreshBalance(publicKey);
    } catch (err) {
      setError(err.message || "Funding failed");
    } finally {
      setLoading(false);
    }
  };

  const signTx = async (txXdr) => {
    if (isDemoMode) {
      if (!demoSecretKey) {
        throw new Error("Demo wallet is missing secret key.");
      }
      const keypair = StellarSdk.Keypair.fromSecret(demoSecretKey);
      const tx = StellarSdk.TransactionBuilder.fromXDR(txXdr, StellarSdk.Networks.TESTNET);
      tx.sign(keypair);
      return tx.toXDR();
    } else {
      // Freighter signature flow
      const result = await signTransaction(txXdr, {
        network: "TESTNET",
        networkPassphrase: StellarSdk.Networks.TESTNET,
        address: publicKey,
      });
      if (result && result.error) {
        throw new Error(result.error.message || result.error || "Transaction cancelled by user");
      }
      const signedXdr = typeof result === 'string' ? result : (result.signedTxXdr || result);
      if (!signedXdr) {
        throw new Error("Transaction cancelled by user");
      }
      return signedXdr;
    }
  };

  return {
    publicKey,
    balance,
    isInstalled,
    isDemoMode,
    loading,
    error,
    activity,
    activityLoading,
    connectWallet,
    connectDemoWallet,
    disconnectWallet,
    refreshBalance,
    fundAccount,
    signTx,
  };
};

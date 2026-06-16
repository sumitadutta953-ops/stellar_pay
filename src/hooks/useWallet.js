import { useState, useEffect, useCallback } from 'react';
import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { defaultModules } from '@creit.tech/stellar-wallets-kit/modules/utils';
import { fetchXlmBalance, fundWithFriendbot, getHorizonServer } from '../utils/stellar';
import * as StellarSdk from 'stellar-sdk';

// Initialize the Stellar Wallets Kit once
StellarWalletsKit.init({
  modules: defaultModules(),
  network: Networks.TESTNET,
});

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

  // Set isInstalled to true since we have multiple wallet options available
  useEffect(() => {
    setIsInstalled(true);
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
      const modalResult = await StellarWalletsKit.authModal();
      const pubKey = modalResult.address;
      
      if (!pubKey) {
        throw new Error("Could not retrieve public key. Please unlock your wallet.");
      }
      
      setIsDemoMode(false);
      setDemoSecretKey(null);
      setPublicKey(pubKey);
      await refreshBalance(pubKey);
    } catch (err) {
      console.error("Wallet connection error:", err);
      let userFriendlyError = err.message || err.toString() || "Failed to connect wallet";
      
      if (
        userFriendlyError.includes("not install") || 
        userFriendlyError.includes("not connected") || 
        userFriendlyError.includes("is not available")
      ) {
        userFriendlyError = "Wallet not found: Please install the selected extension.";
      } else if (userFriendlyError.includes("closed the modal")) {
        userFriendlyError = "Connection cancelled: The modal was closed.";
      }
      
      setError(userFriendlyError);
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
      try {
        const result = await StellarWalletsKit.signTransaction(txXdr, {
          networkPassphrase: StellarSdk.Networks.TESTNET,
          address: publicKey,
        });
        return result.signedTxXdr;
      } catch (err) {
        console.error("Signing rejected:", err);
        let errMsg = err.message || err.toString() || "Transaction cancelled by user";
        if (
          errMsg.toLowerCase().includes("cancel") || 
          errMsg.toLowerCase().includes("reject") || 
          errMsg.toLowerCase().includes("user reject") ||
          errMsg.toLowerCase().includes("declined")
        ) {
          throw new Error("User rejected: The transaction signing request was cancelled.");
        }
        throw new Error(errMsg);
      }
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

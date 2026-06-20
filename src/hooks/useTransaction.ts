import { useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';
import { useWalletStore } from '@/store/walletStore';
import { useContractsStore } from '@/store/contractsStore';
import { getXlmBalance, loadAccount, buildPaymentTransaction } from '@/services/stellar';
import { invokeContractFunction } from '@/services/contractService';
import { parseTransactionError } from '@/utils/errorHandler';
import { NETWORK_PASSPHRASE } from '@/utils/constants';
import { showToast } from '@/services/notificationService';
import { logger } from '@/utils/logger';

export function useTransaction() {
  const walletStore = useWalletStore();
  const contractsStore = useContractsStore();

  const sendTransaction = useCallback(
    async (
      senderPublicKey: string,
      destination: string,
      amount: string,
      memo: string,
      signTxFn: (xdr: string) => Promise<string>,
      onSuccess?: () => void
    ) => {
      contractsStore.setTxState('loading');
      contractsStore.setTxError(null);
      contractsStore.setTxHash(null);

      try {
        const server = new StellarSdk.Horizon.Server(
          import.meta.env.VITE_HORIZON_URL ?? 'https://horizon-testnet.stellar.org'
        );

        // Load and validate account
        let sourceAccount: StellarSdk.Horizon.AccountResponse;
        try {
          sourceAccount = await loadAccount(senderPublicKey);
        } catch {
          throw new Error('Account not found on testnet. Please fund it via Friendbot.');
        }

        // Check balance
        const native = sourceAccount.balances.find(b => b.asset_type === 'native');
        const bal = native ? parseFloat(native.balance) : 0;
        if (bal < parseFloat(amount) + 0.00001) {
          throw new Error('Insufficient balance: Not enough XLM to cover this transaction and fees.');
        }

        // Build transaction
        const tx = buildPaymentTransaction(sourceAccount, destination, amount, memo);

        // Sign
        let signedXdr: string;
        try {
          signedXdr = await signTxFn(tx.toXDR());
        } catch (signErr) {
          throw parseTransactionError(signErr);
        }

        if (!signedXdr) throw new Error('User rejected: Signing was cancelled.');

        // Submit
        const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
        const result = await server.submitTransaction(signedTx);

        contractsStore.setTxHash(result.hash);
        contractsStore.setTxState('success');
        showToast('Payment sent successfully!', 'success');
        onSuccess?.();
      } catch (err) {
        logger.error('Transaction failed', err);
        const parsed = parseTransactionError(err);
        contractsStore.setTxState('failure');
        contractsStore.setTxError(parsed.message);
        showToast(parsed.message, 'error');
      }
    },
    [contractsStore]
  );

  const invokeContract = useCallback(
    async (
      senderPublicKey: string,
      contractId: string,
      functionName: string,
      args: StellarSdk.xdr.ScVal[],
      signTxFn: (xdr: string) => Promise<string>,
      onSuccess?: () => void
    ) => {
      contractsStore.setTxState('loading');
      contractsStore.setTxError(null);
      contractsStore.setTxHash(null);

      try {
        const hash = await invokeContractFunction(
          senderPublicKey,
          contractId,
          functionName,
          args,
          signTxFn
        );

        contractsStore.setTxHash(hash);
        contractsStore.setTxState('success');
        showToast(`Contract call "${functionName}" succeeded!`, 'success');
        onSuccess?.();
      } catch (err) {
        logger.error('Contract call failed', err);
        const parsed = parseTransactionError(err);
        contractsStore.setTxState('failure');
        contractsStore.setTxError(parsed.message);
        showToast(parsed.message, 'error');
      }
    },
    [contractsStore]
  );

  const resetTxState = useCallback(() => {
    contractsStore.resetTx();
  }, [contractsStore]);

  return {
    txState: contractsStore.txState,
    txHash: contractsStore.txHash,
    error: contractsStore.txError,
    sendTransaction,
    invokeContract,
    resetTxState,
  };
}

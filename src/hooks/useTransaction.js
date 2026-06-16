import { useState } from 'react';
import * as StellarSdk from 'stellar-sdk';
import { getHorizonServer } from '../utils/stellar';

export const useTransaction = () => {
  const [txState, setTxState] = useState('idle'); // 'idle' | 'loading' | 'success' | 'failure'
  const [txHash, setTxHash] = useState(null);
  const [error, setError] = useState(null);
  const [errorCode, setErrorCode] = useState(null);

  const sendTransaction = async (senderPublicKey, destinationAddress, amount, memo, signTxFn, onSuccess) => {
    setTxState('loading');
    setError(null);
    setErrorCode(null);
    setTxHash(null);

    try {
      const server = getHorizonServer();
      
      // Load source account details from Horizon
      let sourceAccount;
      try {
        sourceAccount = await server.loadAccount(senderPublicKey);
      } catch (accErr) {
        if (accErr.response && accErr.response.status === 404) {
          throw new Error("Your account does not exist on testnet. Please fund it with Friendbot first.");
        }
        throw accErr;
      }

      // Build transaction
      const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: StellarSdk.BASE_FEE,
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(StellarSdk.Operation.payment({
          destination: destinationAddress,
          asset: StellarSdk.Asset.native(),
          amount: amount.toString(),
        }));

      if (memo && memo.trim()) {
        transaction.addMemo(StellarSdk.Memo.text(memo.trim()));
      }

      const builtTx = transaction.setTimeout(300).build();

      // Sign transaction using the passed signer function (Freighter or Demo secret key)
      let signedTxXdr;
      try {
        signedTxXdr = await signTxFn(builtTx.toXDR());
      } catch (signError) {
        console.error("Signing rejected:", signError);
        throw new Error(signError.message || "Transaction cancelled by user");
      }

      if (!signedTxXdr) {
        throw new Error("Transaction cancelled by user");
      }

      // Submit signed transaction to Horizon
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, StellarSdk.Networks.TESTNET);
      const result = await server.submitTransaction(signedTx);
      
      setTxHash(result.hash);
      setTxState('success');
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Transaction failed:", err);
      setTxState('failure');
      
      let errMsg = err.message || "Transaction failed";
      let code = null;

      // Extract details from Horizon response if available
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (data.extras && data.extras.result_codes) {
          const codes = data.extras.result_codes;
          code = codes.transaction;
          if (codes.operations && codes.operations.length > 0) {
            code = `${code} (${codes.operations.join(', ')})`;
          }
        }
        errMsg = data.detail || errMsg;
      }

      setError(errMsg);
      setErrorCode(code);
    }
  };

  const resetTxState = () => {
    setTxState('idle');
    setError(null);
    setErrorCode(null);
    setTxHash(null);
  };

  return {
    txState,
    txHash,
    error,
    errorCode,
    sendTransaction,
    resetTxState,
  };
};

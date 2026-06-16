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

      // Check balance before sending (client-side prevention)
      const nativeBalance = sourceAccount.balances.find(b => b.asset_type === "native");
      const balanceVal = nativeBalance ? parseFloat(nativeBalance.balance) : 0;
      if (balanceVal < parseFloat(amount) + 0.00001) {
        throw new Error("Insufficient balance: You do not have enough XLM to cover this transaction and its gas fees.");
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

      // Sign transaction
      let signedTxXdr;
      try {
        signedTxXdr = await signTxFn(builtTx.toXDR());
      } catch (signError) {
        console.error("Signing rejected:", signError);
        throw signError;
      }

      if (!signedTxXdr) {
        throw new Error("User rejected: The transaction signing request was cancelled.");
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
          if (JSON.stringify(codes).includes("underfunded") || JSON.stringify(codes).includes("insufficient_balance")) {
            errMsg = "Insufficient balance: You do not have enough XLM to cover this transaction and its gas fees.";
          }
        }
        errMsg = data.detail || errMsg;
      }

      if (
        errMsg.toLowerCase().includes("user rejected") ||
        errMsg.toLowerCase().includes("cancel") ||
        errMsg.toLowerCase().includes("reject") ||
        errMsg.toLowerCase().includes("declined")
      ) {
        errMsg = "User rejected: The transaction signing request was cancelled.";
      }

      setError(errMsg);
      setErrorCode(code);
    }
  };

  const invokeContract = async (senderPublicKey, contractId, functionName, signTxFn, onSuccess) => {
    setTxState('loading');
    setError(null);
    setErrorCode(null);
    setTxHash(null);

    try {
      const rpcServer = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org");
      const contract = new StellarSdk.Contract(contractId);

      // Check balance client-side before contract call
      // A standard contract call simulation + execution needs some fee (e.g. 0.1 XLM to be safe)
      let sourceAccount;
      try {
        sourceAccount = await rpcServer.getAccount(senderPublicKey);
      } catch (accErr) {
        throw new Error("Your account does not exist on testnet. Please fund it with Friendbot first.");
      }

      // Build initial transaction
      let tx = new StellarSdk.TransactionBuilder(sourceAccount, {
        fee: "10000", // starting gas fee
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(contract.call(functionName))
        .setTimeout(300)
        .build();

      // Simulate
      const simulatedTx = await rpcServer.simulateTransaction(tx);
      
      if (StellarSdk.rpc.Api.isSimulationSuccess(simulatedTx)) {
        tx = StellarSdk.rpc.assembleTransaction(tx, simulatedTx).build();
      } else {
        const simErr = simulatedTx.error || "Simulation failed. Please verify the contract is deployed and initialized.";
        throw new Error(simErr);
      }

      // Sign transaction
      let signedTxXdr;
      try {
        signedTxXdr = await signTxFn(tx.toXDR());
      } catch (signError) {
        console.error("Signing rejected:", signError);
        throw signError;
      }

      if (!signedTxXdr) {
        throw new Error("User rejected: The transaction signing request was cancelled.");
      }

      // Submit signed transaction
      const signedTx = StellarSdk.TransactionBuilder.fromXDR(signedTxXdr, StellarSdk.Networks.TESTNET);
      const submitResult = await rpcServer.sendTransaction(signedTx);

      if (submitResult.status === "ERROR") {
        throw new Error(submitResult.errorResultXdr || "Transaction submission failed.");
      }

      // Poll transaction status
      let txResult = submitResult;
      let attempts = 0;
      while (txResult.status === "PENDING" && attempts < 25) {
        await new Promise(r => setTimeout(r, 1000));
        txResult = await rpcServer.getTransaction(submitResult.hash);
        attempts++;
      }

      if (txResult.status === "SUCCESS") {
        setTxHash(submitResult.hash);
        setTxState('success');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(txResult.errorResultXdr || "Transaction execution failed.");
      }
    } catch (err) {
      console.error("Contract call failed:", err);
      setTxState('failure');
      
      let errMsg = err.message || "Contract call failed";
      
      if (
        errMsg.toLowerCase().includes("user rejected") ||
        errMsg.toLowerCase().includes("cancel") ||
        errMsg.toLowerCase().includes("reject") ||
        errMsg.toLowerCase().includes("declined")
      ) {
        errMsg = "User rejected: The transaction signing request was cancelled.";
      } else if (errMsg.includes("MissingValue") || errMsg.includes("Storage")) {
        errMsg = "Contract storage missing: Please make sure your contract is deployed and initialized.";
      } else if (errMsg.includes("underfunded") || errMsg.includes("insufficient_balance")) {
        errMsg = "Insufficient balance: You do not have enough XLM to cover this contract invocation fee.";
      }

      setError(errMsg);
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
    invokeContract,
    resetTxState,
  };
};

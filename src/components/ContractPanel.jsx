import React, { useState, useEffect, useCallback } from 'react';
import * as StellarSdk from '@stellar/stellar-sdk';

export default function ContractPanel({
  publicKey,
  signTx,
  invokeContract,
  txState,
  refreshBalance,
}) {
  const [contractId, setContractId] = useState(
    localStorage.getItem('stellar_pay_contract_id_v2') || 'CANKOB2VLLLRDXYBDRMCUM754QIDGW2Y27FUHC26PLKJQ5PYTZSFIE3P'
  );
  const [counterValue, setCounterValue] = useState(null);
  const [loadingValue, setLoadingValue] = useState(false);
  const [readError, setReadError] = useState(null);
  const [isEditingId, setIsEditingId] = useState(false);
  const [tempId, setTempId] = useState(contractId);

  // Save contract ID to local storage when changed
  useEffect(() => {
    localStorage.setItem('stellar_pay_contract_id_v2', contractId);
    setTempId(contractId);
  }, [contractId]);

  // Read counter value from Soroban contract
  const fetchContractValue = useCallback(async () => {
    if (!contractId || !contractId.startsWith('C')) {
      setReadError('Invalid Contract ID');
      setCounterValue(null);
      return;
    }
    setLoadingValue(true);
    setReadError(null);

    try {
      const rpcServer = new StellarSdk.rpc.Server('https://soroban-testnet.stellar.org');
      const contract = new StellarSdk.Contract(contractId);

      // Create a dummy account for simulation
      const dummyAccount = new StellarSdk.Account('GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF', '0');
      
      const tx = new StellarSdk.TransactionBuilder(dummyAccount, {
        fee: '100',
        networkPassphrase: StellarSdk.Networks.TESTNET,
      })
        .addOperation(contract.call('get_value'))
        .setTimeout(30)
        .build();

      const simResult = await rpcServer.simulateTransaction(tx);

      if (StellarSdk.rpc.Api.isSimulationSuccess(simResult)) {
        if (simResult.results && simResult.results[0] && simResult.results[0].retval) {
          const rawVal = simResult.results[0].retval;
          const nativeVal = StellarSdk.scValToNative(rawVal);
          setCounterValue(nativeVal);
        } else {
          setCounterValue(0);
        }
      } else {
        // Fallback: If get_value fails due to missing state (uninitialized), it's effectively 0
        const simErr = simResult.error || '';
        if (simErr.includes('MissingValue') || simErr.includes('Storage')) {
          setCounterValue(0);
        } else {
          throw new Error(simErr || 'Simulation failed');
        }
      }
    } catch (err) {
      console.error('Failed to read contract value:', err);
      // If the simulation fails because the contract is not found or not initialized yet
      setReadError('Could not read state (uninitialized or expired)');
      setCounterValue(null);
    } finally {
      setLoadingValue(false);
    }
  }, [contractId]);

  // Fetch contract value on mount and when contract ID changes
  useEffect(() => {
    fetchContractValue();
  }, [fetchContractValue]);

  // Trigger contract value refresh when transaction succeeds
  useEffect(() => {
    if (txState === 'success') {
      fetchContractValue();
      if (publicKey) {
        refreshBalance(publicKey);
      }
    }
  }, [txState, fetchContractValue, publicKey, refreshBalance]);

  const handleIncrement = async () => {
    if (!publicKey) return;
    await invokeContract(publicKey, contractId, 'increment', signTx, () => {
      // Success callback (handled by useEffect on txState === 'success')
    });
  };

  const handleDecrement = async () => {
    if (!publicKey) return;
    await invokeContract(publicKey, contractId, 'decrement', signTx, () => {
      // Success callback
    });
  };

  const saveContractId = () => {
    if (tempId && tempId.trim().startsWith('C') && tempId.trim().length === 56) {
      setContractId(tempId.trim());
      setIsEditingId(false);
    } else {
      alert('Please enter a valid 56-character Soroban Contract ID starting with C');
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 shadow-2xl relative overflow-hidden bg-card/60 border border-borderColor/20">
      <h2 className="text-xs font-bold text-textMuted uppercase tracking-widest font-space flex items-center gap-1.5 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        Soroban Smart Contract (Level 2)
      </h2>

      {/* Contract ID Section */}
      <div className="mb-5 bg-[#0f111e]/60 rounded-xl p-3 border border-borderColor/10">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[10px] text-textMuted font-mono font-bold tracking-wider uppercase">Contract Address</span>
          {!isEditingId ? (
            <button
              onClick={() => setIsEditingId(true)}
              className="text-[10px] text-primary hover:text-primaryFocus font-medium transition-colors"
            >
              Change ID
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={saveContractId}
                className="text-[10px] text-green-400 hover:text-green-300 font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setTempId(contractId);
                  setIsEditingId(false);
                }}
                className="text-[10px] text-textMuted hover:text-textPrimary font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {isEditingId ? (
          <input
            type="text"
            value={tempId}
            onChange={(e) => setTempId(e.target.value)}
            className="w-full text-xs font-mono bg-[#16192b] border border-borderColor/30 rounded px-2 py-1 text-textPrimary focus:outline-none focus:border-primary"
          />
        ) : (
          <div className="text-[11px] font-mono text-textPrimary break-all bg-black/20 p-2 rounded">
            {contractId}
          </div>
        )}
      </div>

      {/* On-Chain Counter Value */}
      <div className="flex flex-col items-center justify-center py-6 border-b border-borderColor/10 mb-5">
        <span className="text-[10px] text-textMuted font-mono uppercase tracking-widest mb-1">On-Chain Counter</span>
        {loadingValue ? (
          <div className="flex items-center gap-2 py-2">
            <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs text-textMuted">Syncing ledger state...</span>
          </div>
        ) : readError ? (
          <div className="flex flex-col items-center text-center">
            <span className="text-xs text-amber-500 font-medium">{readError}</span>
            <button
              onClick={fetchContractValue}
              className="text-[10px] text-primary hover:underline mt-1"
            >
              Retry Sync
            </button>
          </div>
        ) : (
          <div className="text-5xl font-extrabold font-space text-textPrimary tracking-tight">
            {counterValue !== null ? counterValue : '0'}
          </div>
        )}
      </div>

      {/* Write Interactions */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handleDecrement}
            disabled={!publicKey || txState === 'loading' || loadingValue}
            className="flex-1 py-3 px-4 rounded-xl bg-card border border-borderColor/30 text-textPrimary hover:bg-cardFocus font-semibold transition-all duration-200 text-xs flex justify-center items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none"
          >
            ➖ Decrement
          </button>
          <button
            onClick={handleIncrement}
            disabled={!publicKey || txState === 'loading' || loadingValue}
            className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primaryFocus text-[#0D0F1A] font-bold transition-all duration-200 text-xs flex justify-center items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-primary/10"
          >
            ➕ Increment
          </button>
        </div>
        {!publicKey && (
          <p className="text-[10px] text-amber-500/80 text-center">
            ⚠️ Connect your wallet to make smart contract write calls.
          </p>
        )}
      </div>
    </div>
  );
}

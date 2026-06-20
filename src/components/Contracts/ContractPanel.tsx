import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useTransaction } from '@/hooks/useTransaction';
import { useContractRead } from '@/hooks/useContract';
import { useContractsStore } from '@/store/contractsStore';
import { Card, CardHeader } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import { Spinner } from '@/components/Common/Loading';
import * as StellarSdk from '@stellar/stellar-sdk';

export function ContractPanel() {
  const { publicKey, signTx } = useWallet();
  const { invokeContract, txState } = useTransaction();
  const { counterContractId, txHash, txError } = useContractsStore();
  const [isEditingId, setIsEditingId] = useState(false);
  const [tempId, setTempId] = useState(counterContractId);
  const setCounterContractId = useContractsStore(s => s.setHubContractId);

  const { data: counterRaw, isLoading: counterLoading, refetch } = useContractRead(
    counterContractId,
    'get_value',
    !!counterContractId
  );

  const counterValue = counterRaw
    ? (() => {
        try {
          const v = StellarSdk.scValToNative(counterRaw);
          return typeof v === 'bigint' ? Number(v) : v;
        } catch {
          return 0;
        }
      })()
    : 0;

  const handleIncrement = async () => {
    if (!publicKey) return;
    await invokeContract(publicKey, counterContractId, 'increment', [], signTx, () => {
      setTimeout(() => refetch(), 2000);
    });
  };

  const handleDecrement = async () => {
    if (!publicKey) return;
    await invokeContract(publicKey, counterContractId, 'decrement', [], signTx, () => {
      setTimeout(() => refetch(), 2000);
    });
  };

  const isLoading = txState === 'loading';

  return (
    <Card id="contract" glow>
      <CardHeader title="Soroban Smart Contract" icon="◈" subtitle="Counter — Level 2 + 3" />

      <div className="p-5 space-y-4">
        {/* Contract ID */}
        <div className="bg-black/30 rounded-xl p-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider font-bold">
              Contract Address
            </span>
            {!isEditingId ? (
              <button
                onClick={() => setIsEditingId(true)}
                className="text-[10px] text-[#7B61FF] hover:text-[#9B81FF] font-medium"
              >
                Change
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (tempId.startsWith('C') && tempId.length === 56) {
                      setCounterContractId(tempId);
                      setIsEditingId(false);
                    }
                  }}
                  className="text-[10px] text-[#10B981] font-medium"
                >
                  Save
                </button>
                <button
                  onClick={() => { setTempId(counterContractId); setIsEditingId(false); }}
                  className="text-[10px] text-[#9CA3AF] font-medium"
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
              onChange={e => setTempId(e.target.value)}
              className="w-full text-xs font-mono bg-black/40 border border-[rgba(123,97,255,0.3)] rounded-lg px-2 py-1.5 text-[#F9FAFB] focus:outline-none"
            />
          ) : (
            <p className="font-mono text-[11px] text-[#F9FAFB] break-all">{counterContractId}</p>
          )}
        </div>

        {/* Counter value */}
        <div className="text-center py-5 border-b border-[rgba(123,97,255,0.08)]">
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-widest mb-2">On-Chain Counter</p>
          {counterLoading ? (
            <div className="flex justify-center py-2"><Spinner /></div>
          ) : (
            <p className="text-5xl font-extrabold text-[#F9FAFB] font-mono tracking-tight">
              {typeof counterValue === 'number' ? counterValue : '—'}
            </p>
          )}
        </div>

        {/* TX result */}
        {txState === 'success' && txHash && (
          <div className="p-2.5 rounded-xl bg-[#10B981]/8 border border-[#10B981]/20 text-xs text-[#10B981]">
            <p className="font-semibold mb-0.5">✓ Success</p>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] break-all hover:underline"
            >
              {txHash}
            </a>
          </div>
        )}
        {txState === 'failure' && txError && (
          <div className="p-2.5 rounded-xl bg-[#E11D48]/8 border border-[#E11D48]/20 text-xs text-[#E11D48]">
            {txError}
          </div>
        )}

        {/* Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            id="decrement-btn"
            variant="secondary"
            onClick={handleDecrement}
            isLoading={isLoading}
            disabled={!publicKey}
          >
            ➖ Decrement
          </Button>
          <Button
            id="increment-btn"
            variant="primary"
            onClick={handleIncrement}
            isLoading={isLoading}
            disabled={!publicKey}
          >
            ➕ Increment
          </Button>
        </div>

        {!publicKey && (
          <p className="text-[10px] text-amber-500/80 text-center">
            ⚠️ Connect wallet to make contract write calls
          </p>
        )}
      </div>
    </Card>
  );
}

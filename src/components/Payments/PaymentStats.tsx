import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useContractRead } from '@/hooks/useContract';
import { useContractsStore } from '@/store/contractsStore';
import { Card, CardHeader } from '@/components/Common/Card';
import { Spinner } from '@/components/Common/Loading';
import * as StellarSdk from '@stellar/stellar-sdk';

function StatBox({ label, value, icon }: { label: string; value: string | number; icon: string }) {
  return (
    <div className="bg-black/20 rounded-xl p-3 text-center">
      <span className="text-2xl">{icon}</span>
      <p className="text-xl font-extrabold text-[#F9FAFB] font-mono mt-1">{value}</p>
      <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
}

export function PaymentStats() {
  const { publicKey } = useWallet();
  const { counterContractId } = useContractsStore();

  const { data: counterRaw, isLoading } = useContractRead(counterContractId, 'get_value', !!counterContractId);

  const counterValue = counterRaw
    ? (typeof StellarSdk.scValToNative(counterRaw) === 'bigint'
        ? Number(StellarSdk.scValToNative(counterRaw))
        : StellarSdk.scValToNative(counterRaw))
    : 0;

  return (
    <Card id="stats-card">
      <CardHeader title="On-Chain Stats" icon="📊" subtitle="Counter Contract (Level 2)" />
      <div className="p-5">
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Spinner />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            <StatBox label="Counter Value" value={counterValue as number} icon="🔢" />
          </div>
        )}

        <p className="text-[10px] text-[#6B7280] text-center mt-3">
          Auto-syncs every 10s from Soroban RPC
        </p>
      </div>
    </Card>
  );
}

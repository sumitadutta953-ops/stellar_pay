import React from 'react';
import { useContractsStore } from '@/store/contractsStore';
import { Card, CardHeader } from '@/components/Common/Card';
import { formatTimestamp } from '@/utils/formatting';

export function ContractLogs() {
  const { txState, txHash, txError } = useContractsStore();

  return (
    <Card>
      <CardHeader title="Contract Call Logs" icon="📋" />
      <div className="p-4">
        {txState === 'idle' && (
          <p className="text-xs text-[#9CA3AF] text-center py-4">No recent contract calls</p>
        )}
        {txState === 'loading' && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#7B61FF]/8 border border-[#7B61FF]/20">
            <span className="w-3 h-3 rounded-full border-2 border-[#7B61FF]/30 border-t-[#7B61FF] animate-spin" />
            <span className="text-xs text-[#7B61FF]">Submitting transaction…</span>
          </div>
        )}
        {txState === 'success' && txHash && (
          <div className="p-3 rounded-xl bg-[#10B981]/8 border border-[#10B981]/20 space-y-1">
            <p className="text-xs font-semibold text-[#10B981]">✓ Contract call succeeded</p>
            <p className="text-[10px] text-[#9CA3AF]">{formatTimestamp(Math.floor(Date.now() / 1000))}</p>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-[#7B61FF] hover:underline break-all block"
            >
              TX: {txHash}
            </a>
          </div>
        )}
        {txState === 'failure' && txError && (
          <div className="p-3 rounded-xl bg-[#E11D48]/8 border border-[#E11D48]/20">
            <p className="text-xs font-semibold text-[#E11D48]">✕ Contract call failed</p>
            <p className="text-xs text-[#E11D48]/80 mt-1">{txError}</p>
          </div>
        )}
      </div>
    </Card>
  );
}

import React from 'react';

export default function NetworkStats() {
  return (
    <div className="glass-card rounded-2xl p-5 shadow-2xl relative overflow-hidden">

      <h2 className="text-xs font-bold text-textMuted uppercase tracking-widest font-space flex items-center gap-1.5 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
        Network Parameters
      </h2>

      <div className="space-y-3.5">
        {/* API Endpoint */}
        <div className="flex justify-between items-start text-xs border-b border-borderColor/25 pb-2.5">
          <span className="text-textMuted font-medium">Horizon API</span>
          <div className="text-right">
            <span className="font-semibold text-textPrimary block">horizon-testnet.stellar.org</span>
            <span className="text-[9px] text-secondary font-bold uppercase font-space">Operational</span>
          </div>
        </div>

        {/* Base fee */}
        <div className="flex justify-between items-center text-xs border-b border-borderColor/25 pb-2.5">
          <span className="text-textMuted font-medium">Base Gas Fee</span>
          <span className="font-mono font-semibold text-textPrimary">0.00001 XLM <span className="text-[10px] text-textMuted">(100 Stroops)</span></span>
        </div>

        {/* Avg ledger close time */}
        <div className="flex justify-between items-center text-xs border-b border-borderColor/25 pb-2.5">
          <span className="text-textMuted font-medium">Avg Ledger Close</span>
          <span className="font-semibold text-textPrimary font-space">~ 5.2 seconds</span>
        </div>

        {/* Network passphrase */}
        <div className="flex flex-col gap-1 text-xs">
          <span className="text-textMuted font-medium">Network Passphrase</span>
          <code className="font-mono text-[9px] bg-[#111322] border border-borderColor/40 p-1.5 rounded text-textPrimary select-all overflow-x-auto whitespace-nowrap scrollbar-thin">
            Test SDF Network ; September 2015
          </code>
        </div>
      </div>
    </div>
  );
}

import React from 'react';

export default function TransactionConfirmModal({
  isOpen,
  txDetails,
  isDemoMode,
  onConfirm,
  onCancel,
}) {
  if (!isOpen || !txDetails) return null;

  const { destination, amount, memo } = txDetails;

  return (
    <div className="fixed inset-0 bg-[#080A11]/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="glass-card w-full max-w-[420px] rounded-2xl p-6 shadow-2xl relative overflow-hidden border border-borderColor animate-scale">
        {/* Background ambient glow inside modal */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-[48px] pointer-events-none" />

        <div className="flex justify-between items-center mb-5 pb-3 border-b border-borderColor/40">
          <h3 className="text-sm font-bold font-space text-textPrimary uppercase tracking-widest flex items-center gap-2">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Review Transaction
          </h3>
          <button
            onClick={onCancel}
            className="text-textMuted hover:text-textPrimary transition-colors p-1 rounded-lg hover:bg-borderColor/30"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Transaction visual summary */}
        <div className="text-center py-4 bg-[#111322] border border-borderColor/50 rounded-xl mb-5">
          <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block font-space">Amount to Send</span>
          <div className="text-2xl font-bold text-textPrimary font-space tracking-tight mt-1 flex items-baseline justify-center gap-1">
            <span>{parseFloat(amount).toFixed(7)}</span>
            <span className="text-xs text-primary font-bold">XLM</span>
          </div>
          
          <div className="flex justify-center my-2 text-textMuted/40">
            <svg className="w-5 h-5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>

          <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block font-space">Recipient</span>
          <p className="font-mono text-xs text-textPrimary font-semibold tracking-wide px-4 truncate mt-1">
            {destination}
          </p>
        </div>

        {/* Detail specs table */}
        <div className="space-y-3 text-xs mb-6">
          <div className="flex justify-between items-center py-1.5 border-b border-borderColor/20">
            <span className="text-textMuted font-medium">Network</span>
            <span className="font-semibold text-textPrimary">Stellar Testnet</span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-borderColor/20">
            <span className="text-textMuted font-medium">Estimated Fee</span>
            <span className="font-semibold text-textPrimary">0.0000100 XLM</span>
          </div>

          <div className="flex justify-between items-start py-1.5 border-b border-borderColor/20">
            <span className="text-textMuted font-medium">Memo</span>
            <span className="font-mono text-textPrimary break-all text-right max-w-[200px]">
              {memo && memo.trim() ? memo.trim() : <span className="text-textMuted/40 italic">None</span>}
            </span>
          </div>
        </div>

        {/* Action guidelines */}
        <div className="p-3 bg-primary/5 border border-primary/15 rounded-xl text-center mb-6">
          <p className="text-[10px] text-textMuted/90 leading-relaxed">
            {isDemoMode ? (
              <span><strong>Simulator Signing:</strong> Authorizing locally using simulated private keys. No extensions needed.</span>
            ) : (
              <span><strong>Freighter Approval Required:</strong> You will be prompted to sign this transaction in the Freighter popup window.</span>
            )}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3.5">
          <button
            onClick={onCancel}
            className="flex-1 py-3 bg-[#1C1F35] hover:bg-[#252A47] border border-borderColor text-textPrimary font-bold rounded-xl transition-all duration-200 text-xs font-space"
          >
            Reject / Cancel
          </button>
          
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-primary hover:bg-primary/95 text-textPrimary font-bold rounded-xl transition-all duration-250 shadow-lg shadow-primary/15 hover:shadow-primary/25 text-xs font-space"
          >
            {isDemoMode ? 'Approve & Sign' : 'Confirm in Wallet'}
          </button>
        </div>
      </div>
    </div>
  );
}

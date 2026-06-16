import React from 'react';
import CopyButton from './CopyButton';

export default function TransactionResult({
  txState,
  txHash,
  error,
  errorCode,
  onClose,
}) {
  if (txState === 'idle') return null;

  return (
    <div className="glass-card rounded-2xl p-[28px] shadow-2xl mt-6 animate-fadeIn relative overflow-hidden">

      <button
        onClick={onClose}
        type="button"
        className="absolute top-4 right-4 text-textMuted hover:text-textPrimary transition-colors duration-250 p-1 rounded-lg hover:bg-borderColor/30"
        title="Close Status"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {txState === 'loading' && (
        <div className="flex flex-col items-center justify-center py-5 text-center animate-scale">
          <div className="relative mb-4">
            {/* Double ring spinner */}
            <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-1.5 rounded-full border-2 border-secondary/15 border-b-secondary animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
          </div>
          <h3 className="font-bold text-textPrimary text-xs font-space uppercase tracking-widest mb-1.5">
            Submitting Transaction
          </h3>
          <p className="text-[11px] text-textMuted/80 max-w-xs leading-relaxed">
            Broadcasting your payment operation to Stellar Testnet ledger. Please sign in your wallet extension if prompted...
          </p>
        </div>
      )}

      {txState === 'success' && (
        <div className="space-y-4 animate-scale">
          <div className="flex items-center gap-3.5 p-4 bg-secondary/10 border border-secondary/20 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0 shadow-lg shadow-secondary/10">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-secondary text-xs font-space uppercase tracking-wider">
                Transaction Success
              </h3>
              <p className="text-[10px] text-secondary/80 leading-normal">
                Payment finalized and validated on ledger.
              </p>
            </div>
          </div>

          <div className="space-y-3.5">
            <div className="bg-[#111322] border border-borderColor/45 p-3.5 rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider font-space">Transaction Hash</span>
                <CopyButton text={txHash} label="Copy Hash" />
              </div>
              <p className="font-mono text-[10px] text-textPrimary/90 break-all bg-[#171A2E]/80 p-2.5 rounded border border-borderColor/30">
                {txHash}
              </p>
            </div>

            <a
              href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex justify-center items-center gap-1.5 py-3 bg-secondary hover:bg-secondary/95 text-[#080A11] font-bold rounded-xl transition-all duration-200 shadow-lg shadow-secondary/15 text-xs font-space"
            >
              <span>View on Stellar Expert</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}

      {txState === 'failure' && (
        <div className="space-y-4 animate-scale">
          <div className="flex items-center gap-3.5 p-4 bg-error/10 border border-error/20 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center text-error shrink-0 shadow-lg shadow-error/10">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div className="space-y-0.5">
              <h3 className="font-bold text-error text-xs font-space uppercase tracking-wider">
                Transaction Failed
              </h3>
              <p className="text-[10px] text-error/80 leading-normal">
                The network or wallet signer rejected this request.
              </p>
            </div>
          </div>

          <div className="bg-[#111322] border border-borderColor/45 p-4 rounded-xl space-y-3.5 text-left">
            <div className="space-y-1">
              <span className="text-[9px] text-textMuted block uppercase font-bold tracking-wider font-space">Failure Details</span>
              <p className="text-xs text-textPrimary font-semibold leading-relaxed">{error}</p>
            </div>
            {errorCode && (
              <div className="space-y-1 pt-1.5 border-t border-borderColor/35">
                <span className="text-[9px] text-textMuted block uppercase font-bold tracking-wider font-space">Result Code</span>
                <code className="font-mono text-[9px] text-error bg-error/10 px-2 py-0.5 rounded border border-error/20 inline-block font-semibold">
                  {errorCode}
                </code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

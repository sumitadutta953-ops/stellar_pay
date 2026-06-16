import React from 'react';

export default function ActivityLog({
  publicKey,
  activity,
  loading,
}) {
  const truncateKey = (key) => {
    if (!key) return "";
    return `${key.slice(0, 6)}...${key.slice(-4)}`;
  };

  return (
    <div className="glass-card rounded-2xl p-[28px] shadow-2xl relative overflow-hidden">
      <h2 className="text-xs font-bold text-textMuted uppercase tracking-widest font-space flex items-center gap-1.5 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        Recent Transactions
      </h2>

      {!publicKey ? (
        <div className="text-center py-8">
          <svg className="w-8 h-8 text-textMuted/35 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          <p className="text-textMuted text-xs font-semibold uppercase tracking-wider font-space">
            Wallet Disconnected
          </p>
          <p className="text-textMuted/65 text-[10px] mt-1 max-w-[240px] mx-auto leading-relaxed">
            Please connect your Freighter wallet or launch the Simulator to view transaction logs.
          </p>
        </div>
      ) : loading ? (
        <div className="space-y-3.5 py-2">
          {/* Skeleton Loaders */}
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex justify-between items-center bg-[#111322]/50 border border-borderColor/25 p-3 rounded-xl animate-pulse">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-borderColor/60 rounded-lg" />
                <div className="space-y-1.5">
                  <div className="w-16 h-3 bg-borderColor/60 rounded" />
                  <div className="w-24 h-2 bg-borderColor/45 rounded" />
                </div>
              </div>
              <div className="w-12 h-4 bg-borderColor/60 rounded" />
            </div>
          ))}
        </div>
      ) : activity.length === 0 ? (
        <div className="text-center py-8">
          <svg className="w-8 h-8 text-textMuted/30 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-textMuted text-xs font-semibold font-space uppercase tracking-wider">No Activity Yet</p>
          <p className="text-textMuted/60 text-[10px] mt-1 max-w-[260px] mx-auto leading-relaxed">
            No transactions found on ledger. Try funding your account via Friendbot or send a payment to start logs.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin animate-fadeIn">
          {activity.map((tx) => {
            const isReceive = tx.typeCode === 'receive';
            return (
              <div
                key={tx.id}
                className={`flex justify-between items-center bg-[#111322] border border-borderColor/40 border-l-4 p-3 rounded-xl hover:border-borderColor/70 transition-colors ${
                  isReceive ? 'border-l-[#00D4AA]' : 'border-l-[#FF4D6A]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Status Indicator Icon */}
                  <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center shrink-0 ${
                    isReceive
                      ? 'bg-secondary/10 text-secondary border border-secondary/20'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    {isReceive ? (
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 13l-7 7-7-7m14-6l-7 7-7-7" />
                      </svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
                      </svg>
                    )}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-textPrimary font-space">
                        {tx.type === 'Send' ? 'Sent XLM' : tx.type}
                      </span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-textMuted hover:text-primary transition-colors"
                        title="View transaction on explorer"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                    <span className="text-[10px] text-textMuted/70 font-mono block truncate">
                      {isReceive ? `From: ${truncateKey(tx.from)}` : `To: ${truncateKey(tx.to)}`}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-xs font-bold font-space ${
                    isReceive ? 'text-secondary' : 'text-textPrimary'
                  }`}>
                    {isReceive ? '+' : '-'}{parseFloat(tx.amount).toFixed(4)} XLM
                  </span>
                  <span className="text-[8px] text-textMuted/50 font-mono block mt-0.5">
                    {new Date(tx.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import React from 'react';

export default function Navbar({
  publicKey,
  isDemoMode,
  disconnectWallet,
}) {
  const truncatedKey = publicKey
    ? `${publicKey.slice(0, 5)}...${publicKey.slice(-4)}`
    : "";

  return (
    <nav className="w-full border-b border-borderColor bg-card/75 backdrop-blur-md sticky top-0 z-40 px-4 md:px-8 py-3.5 flex justify-between items-center select-none">
      <div className="flex items-center gap-6">
        {/* Brand logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/20 flex items-center justify-center text-primary shadow-md shadow-primary/5">
            <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold font-space text-textPrimary tracking-tight leading-none">
              StellarPay
            </h1>
            <span className="text-[9px] text-textMuted/70 font-mono tracking-wider uppercase font-bold">Terminal</span>
          </div>
        </div>

        {/* Navigation links (Desktop) */}
        <div className="hidden md:flex items-center gap-5 text-xs text-textMuted font-medium font-space">
          <a href="#dashboard" className="text-textPrimary font-semibold transition-colors">Dashboard</a>
          <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noopener noreferrer" className="hover:text-textPrimary transition-colors flex items-center gap-1">
            <span>Explorer</span>
            <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
          <a href="https://laboratory.stellar.org/#account-creator?network=testnet" target="_blank" rel="noopener noreferrer" className="hover:text-textPrimary transition-colors flex items-center gap-1">
            <span>Lab Faucet</span>
            <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Network Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[9px] font-bold uppercase tracking-wider font-space">
            Testnet
          </span>
        </div>

        {/* Account indicator */}
        {publicKey ? (
          <div className="flex items-center gap-2 px-2.5 py-1 bg-[#111322] border border-borderColor rounded-xl text-xs font-semibold">
            <span className="font-mono text-textPrimary tracking-wide">{truncatedKey}</span>
            <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
              isDemoMode ? 'bg-secondary/15 text-secondary' : 'bg-primary/15 text-primary'
            }`}>
              {isDemoMode ? 'Sim' : 'HW'}
            </span>
            <button
              onClick={disconnectWallet}
              className="text-error/70 hover:text-error transition-colors text-[9px] font-bold uppercase font-space ml-1 pl-1.5 border-l border-borderColor/60"
            >
              Exit
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#111322] border border-borderColor/60 text-textMuted rounded-xl text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-textMuted/40" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-space">Disconnected</span>
          </div>
        )}
      </div>
    </nav>
  );
}

import React from 'react';

export default function Header() {
  return (
    <header className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/5">
          <svg
            className="w-5.5 h-5.5 text-primary animate-pulse"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.786 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.21l8.2-1.192L12 .587z" />
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold font-space text-textPrimary tracking-tight leading-none">
            StellarPay
          </h1>
          <span className="text-[10px] text-textMuted font-mono">Simple Payment dApp</span>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/25 text-primary rounded-full">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
        <span className="text-[10px] font-bold uppercase tracking-wider font-space">
          Testnet
        </span>
      </div>
    </header>
  );
}

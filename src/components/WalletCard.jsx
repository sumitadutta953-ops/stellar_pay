import React from 'react';
import CopyButton from './CopyButton';

export default function WalletCard({
  publicKey,
  balance,
  isInstalled,
  isDemoMode,
  loading,
  error,
  connectWallet,
  connectDemoWallet,
  disconnectWallet,
  refreshBalance,
  fundAccount,
}) {
  const truncatedKey = publicKey
    ? `${publicKey.slice(0, 8)}...${publicKey.slice(-6)}`
    : "";

  return (
    <div className="glass-card glass-card-hover rounded-2xl p-[28px] shadow-2xl relative overflow-hidden mb-6">

      <div className="flex justify-between items-center mb-5 z-10 relative">
        <h2 className="text-xs font-bold text-textMuted uppercase tracking-widest font-space flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          My Wallet
        </h2>
        {publicKey && (
          <div className="flex items-center gap-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]"></span>
            </span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
              isDemoMode
                ? 'bg-secondary/10 text-secondary border-secondary/25'
                : 'bg-primary/10 text-primary border-primary/25'
            }`}>
              Connected ({isDemoMode ? 'Simulator' : 'Freighter'})
            </span>
          </div>
        )}
      </div>

      {!publicKey ? (
        <div className="z-10 relative">
          {/* Display connection errors if they occur */}
          {error && (
            <div className="p-4 bg-error/10 border border-error/20 rounded-xl text-error text-xs mb-4 animate-scale">
              <div className="flex gap-2.5 items-start">
                <svg className="w-5 h-5 shrink-0 mt-0.5 text-error animate-scale" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="space-y-0.5">
                  <p className="font-bold font-space">Connection Error</p>
                  <p className="text-error/80 leading-relaxed">{error}</p>
                </div>
              </div>
            </div>
          )}

          {!isInstalled ? (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 bg-error/10 border border-error/20 rounded-2xl flex items-center justify-center mx-auto mb-3.5 text-error">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold font-space text-textPrimary">Freighter Wallet Required</h3>
                <p className="text-xs text-textMuted max-w-[320px] mx-auto leading-relaxed">
                  Freighter is the recommended extension for signing Stellar transactions securely.
                </p>
              </div>
              
              <div className="flex flex-col gap-2.5 pt-2">
                <a
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex justify-center items-center gap-2 py-2.5 bg-primary hover:bg-primary/95 text-textPrimary font-bold rounded-xl transition-all duration-200 shadow-lg shadow-primary/20 text-xs font-space"
                >
                  <span>Install Freighter Wallet</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                
                <div className="relative flex py-1.5 items-center">
                  <div className="flex-grow border-t border-borderColor/45"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-textMuted uppercase font-bold tracking-wider font-space">OR</span>
                  <div className="flex-grow border-t border-borderColor/45"></div>
                </div>

                <button
                  onClick={connectDemoWallet}
                  disabled={loading}
                  className="w-full py-2.5 bg-[#1C1F35] hover:bg-[#252A47] border border-borderColor text-textPrimary font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 text-xs font-space"
                >
                  <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Launch Demo Simulator (Instantly Test)</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center py-2">
              <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3 text-primary">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold font-space text-textPrimary">Connect Your Wallet</h3>
                <p className="text-xs text-textMuted max-w-[320px] mx-auto leading-relaxed">
                  Sign in with Freighter to manage assets, or launch the Simulator to test payments immediately.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-3">
                <button
                  onClick={connectWallet}
                  disabled={loading}
                  className="flex-1 py-3 bg-primary hover:bg-primary/95 hover:shadow-lg hover:shadow-primary/15 disabled:opacity-50 text-textPrimary font-bold rounded-xl transition-all duration-250 flex items-center justify-center gap-2 text-xs font-space"
                >
                  {loading && !isDemoMode ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                      <span>Connect Freighter</span>
                    </>
                  )}
                </button>

                <button
                  onClick={connectDemoWallet}
                  disabled={loading}
                  className="flex-1 py-3 bg-[#1C1F35] hover:bg-[#252A47] border border-borderColor text-textPrimary font-bold rounded-xl transition-all duration-250 flex items-center justify-center gap-2 text-xs font-space"
                >
                  {loading && isDemoMode ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-secondary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                      <span>Demo Simulator</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-5 z-10 relative animate-fadeIn">
          {/* Main Account balance card visualization */}
          <div className="bg-gradient-to-br from-[#1E2038] to-[#121424] border border-[#2D3152]/70 rounded-xl p-5 space-y-4 shadow-inner relative overflow-hidden">
            {/* Top row */}
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block font-space">Address</span>
                <span className="font-mono text-sm font-bold text-textPrimary leading-none">
                  {truncatedKey}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <CopyButton text={publicKey} label="Copy Address" />
                <button
                  onClick={disconnectWallet}
                  className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-error/10 text-error border border-error/25 hover:bg-error hover:text-textPrimary rounded-lg transition-all duration-200"
                  title="Disconnect Wallet"
                >
                  Disconnect
                </button>
              </div>
            </div>

            {/* Balance area */}
            <div className="pt-1 border-t border-borderColor/35 space-y-1">
              <span className="text-[10px] text-textMuted font-bold uppercase tracking-wider block font-space">Balance</span>
              {balance !== null ? (
                <div className="text-xl font-bold text-textPrimary font-space tracking-tight flex items-baseline gap-1">
                  <span>{parseFloat(balance).toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 7 })}</span>
                  <span className="text-xs text-primary font-bold">XLM</span>
                </div>
              ) : error && error.includes("Account not funded yet") ? (
                <div className="text-xs font-semibold text-error/95 leading-normal bg-error/5 border border-error/15 p-2 rounded-lg mt-1">
                  Account not funded yet — use Friendbot
                </div>
              ) : (
                <div className="text-xs text-textMuted animate-pulse py-1">
                  {loading ? "Fetching balance..." : "Balance unavailable"}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => refreshBalance()}
              disabled={loading}
              className="flex-1 py-2.5 px-3 bg-[#1C1F35] hover:bg-[#252A47] border border-borderColor text-textPrimary rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 font-space"
            >
              <svg className={`w-3.5 h-3.5 text-primary ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18.5" />
              </svg>
              <span>Refresh</span>
            </button>

            {(!balance || (error && error.includes("Account not funded yet"))) && (
              <button
                onClick={fundAccount}
                disabled={loading}
                className="flex-1 py-2.5 px-3 bg-secondary/10 hover:bg-secondary/20 border border-secondary/35 text-secondary rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 font-space"
              >
                {loading ? (
                  <svg className="animate-spin h-3.5 w-3.5 text-secondary" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                <span>Fund via Friendbot</span>
              </button>
            )}
          </div>

          {/* Show connection errors in connected state too if they pop up */}
          {error && !error.includes("Account not funded yet") && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-xl text-error text-xs animate-scale">
              <p className="font-semibold leading-normal">{error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useUiStore } from '@/store/uiStore';
import { shortenAddress } from '@/utils/formatting';
import { Button } from '@/components/Common/Button';
import { useMobile } from '@/hooks/useMobile';

export function Header() {
  const { publicKey, isConnected, isDemoMode, disconnectWallet } = useWallet();
  const toggleSidebar = useUiStore(s => s.toggleSidebar);
  const isMobile = useMobile();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[rgba(123,97,255,0.1)] bg-[rgba(8,10,17,0.85)] backdrop-blur-md">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 h-14 flex items-center justify-between gap-4">
        {/* Left: Logo + Hamburger */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={toggleSidebar}
              id="sidebar-toggle"
              aria-label="Toggle navigation"
              className="p-2 rounded-lg text-[#9CA3AF] hover:text-[#F9FAFB] hover:bg-white/5 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <div>
              <span className="font-bold text-sm text-[#F9FAFB] tracking-tight">StellarPay</span>
              <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-[#7B61FF]/20 text-[#7B61FF]">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Right: Network badge + Wallet */}
        <div className="flex items-center gap-2 md:gap-3">
          <span className="hidden sm:flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#10B981]/10 text-[#10B981] border border-[#10B981]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
            TESTNET
          </span>

          {isConnected && publicKey ? (
            <div className="flex items-center gap-2">
              {isDemoMode && (
                <span className="hidden sm:block text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  DEMO
                </span>
              )}
              <span className="text-xs font-mono text-[#9CA3AF] hidden md:block">
                {shortenAddress(publicKey)}
              </span>
              <Button variant="ghost" size="sm" onClick={disconnectWallet} id="disconnect-btn">
                Exit
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}

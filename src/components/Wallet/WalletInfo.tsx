import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Card, CardHeader } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import { Spinner } from '@/components/Common/Loading';
import { formatXlm, shortenAddress } from '@/utils/formatting';

export function WalletInfo() {
  const { publicKey, balance, isDemoMode, loading, refreshBalance, fundAccount, disconnectWallet } =
    useWallet();
  const [copied, setCopied] = useState(false);
  const [funding, setFunding] = useState(false);

  if (!publicKey) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(publicKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFund = async () => {
    setFunding(true);
    await fundAccount(publicKey);
    setFunding(false);
  };

  const handleRefresh = () => refreshBalance(publicKey);

  return (
    <Card glow id="wallet-info-card">
      <CardHeader
        title="My Wallet"
        icon="💼"
        subtitle={isDemoMode ? 'Demo Mode' : 'Freighter'}
        action={
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[10px] font-bold text-[#10B981]">
              {isDemoMode ? 'DEMO' : 'CONNECTED'}
            </span>
          </div>
        }
      />

      <div className="p-5 space-y-4">
        {/* Address */}
        <div className="bg-black/30 rounded-xl p-3">
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1">Address</p>
          <div className="flex items-center justify-between gap-2">
            <span className="font-mono text-xs text-[#F9FAFB] truncate">{shortenAddress(publicKey, 8)}</span>
            <button
              onClick={handleCopy}
              className="text-[10px] text-[#7B61FF] hover:text-[#9B81FF] transition-colors shrink-0 font-medium"
              aria-label="Copy address"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Balance */}
        <div className="text-center py-4">
          <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider mb-1">XLM Balance</p>
          {loading ? (
            <Spinner size="md" />
          ) : (
            <p className="text-3xl font-extrabold text-[#F9FAFB] font-mono tracking-tight">
              {formatXlm(balance)}{' '}
              <span className="text-sm font-bold text-[#7B61FF]">XLM</span>
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            id="refresh-balance-btn"
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            leftIcon={<span>↻</span>}
          >
            Refresh
          </Button>
          <Button
            id="fund-account-btn"
            variant="secondary"
            size="sm"
            onClick={handleFund}
            isLoading={funding}
            leftIcon={<span>🚰</span>}
          >
            Friendbot
          </Button>
        </div>

        <Button
          id="disconnect-wallet-btn"
          variant="danger"
          size="sm"
          className="w-full"
          onClick={disconnectWallet}
        >
          Disconnect Wallet
        </Button>
      </div>
    </Card>
  );
}

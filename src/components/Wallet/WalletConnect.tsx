import React from 'react';
import { useWallet } from '@/hooks/useWallet';
import { Button } from '@/components/Common/Button';
import { Card, CardHeader } from '@/components/Common/Card';
import { Spinner } from '@/components/Common/Loading';

export function WalletConnect() {
  const { isConnected, isInstalled, loading, error, connectWallet, connectDemoWallet } =
    useWallet();

  if (isConnected) return null;

  return (
    <Card glow id="wallet-connect-card">
      <CardHeader title="Connect Wallet" icon="💳" />
      <div className="p-5 space-y-4">
        <p className="text-xs text-[#9CA3AF] leading-relaxed">
          Connect your Freighter wallet or use demo mode to explore StellarPay Pro on Stellar
          Testnet.
        </p>

        {error && (
          <div className="p-3 rounded-xl bg-[#E11D48]/8 border border-[#E11D48]/20 text-xs text-[#E11D48]">
            {error}
          </div>
        )}

        <div className="space-y-2.5">
          <Button
            id="connect-freighter-btn"
            variant="primary"
            size="lg"
            className="w-full"
            onClick={connectWallet}
            isLoading={loading}
            disabled={!isInstalled}
            leftIcon={<span>🔐</span>}
          >
            {loading ? 'Connecting…' : 'Connect Freighter'}
          </Button>

          {!isInstalled && (
            <p className="text-[10px] text-amber-500/80 text-center">
              Freighter not detected.{' '}
              <a
                href="https://freighter.app"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-amber-400"
              >
                Install it
              </a>{' '}
              or use demo mode below.
            </p>
          )}

          <Button
            id="connect-demo-btn"
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={connectDemoWallet}
            leftIcon={<span>🎭</span>}
          >
            Demo Mode (no wallet needed)
          </Button>
        </div>
      </div>
    </Card>
  );
}

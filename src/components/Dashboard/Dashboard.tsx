import React from 'react';
import { WalletConnect } from '@/components/Wallet/WalletConnect';
import { WalletInfo } from '@/components/Wallet/WalletInfo';
import { PaymentForm } from '@/components/Payments/PaymentForm';
import { PaymentHistory } from '@/components/Payments/PaymentHistory';
import { PaymentStats } from '@/components/Payments/PaymentStats';
import { ContractPanel } from '@/components/Contracts/ContractPanel';
import { ContractLogs } from '@/components/Contracts/ContractLogs';
import { EventFeed } from '@/components/Contracts/EventFeed';
import { ErrorBoundary } from '@/components/Common/ErrorBoundary';
import { useWallet } from '@/hooks/useWallet';

export function Dashboard() {
  const { isConnected } = useWallet();

  return (
    <main id="dashboard" className="w-full max-w-[1200px] mx-auto px-4 md:px-8 py-6 md:py-10">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-xl md:text-2xl font-extrabold text-[#F9FAFB] tracking-tight">
          ⭐ StellarPay{' '}
          <span className="text-[#7B61FF]">Pro</span>
        </h1>
        <p className="text-xs text-[#9CA3AF] mt-1 max-w-lg">
          Advanced payment platform on Stellar Testnet · Soroban Smart Contracts · Real-time events
        </p>
      </header>

      {/* Responsive Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 items-start">

        {/* Left column: Wallet + Stats + Contract */}
        <div className="md:col-span-1 lg:col-span-4 space-y-5">
          <ErrorBoundary>
            {!isConnected ? <WalletConnect /> : <WalletInfo />}
          </ErrorBoundary>

          <ErrorBoundary>
            <PaymentStats />
          </ErrorBoundary>

          {isConnected && (
            <ErrorBoundary>
              <ContractPanel />
            </ErrorBoundary>
          )}
        </div>

        {/* Right column: Send + Logs + Events */}
        <div className="md:col-span-1 lg:col-span-8 space-y-5">
          <ErrorBoundary>
            <PaymentForm />
          </ErrorBoundary>

          <ErrorBoundary>
            <ContractLogs />
          </ErrorBoundary>

          <ErrorBoundary>
            <EventFeed />
          </ErrorBoundary>

          <ErrorBoundary>
            <PaymentHistory />
          </ErrorBoundary>
        </div>
      </div>
    </main>
  );
}

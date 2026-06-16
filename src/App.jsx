import React, { useState } from 'react';
import { useWallet } from './hooks/useWallet';
import { useTransaction } from './hooks/useTransaction';
import Navbar from './components/Navbar';
import WalletCard from './components/WalletCard';
import SendForm from './components/SendForm';
import ActivityLog from './components/ActivityLog';
import TransactionResult from './components/TransactionResult';
import TransactionConfirmModal from './components/TransactionConfirmModal';
import ContractPanel from './components/ContractPanel';

export default function App() {
  const {
    publicKey,
    balance,
    isInstalled,
    isDemoMode,
    loading: walletLoading,
    error: walletError,
    activity,
    activityLoading,
    connectWallet,
    connectDemoWallet,
    disconnectWallet,
    refreshBalance,
    fundAccount,
    signTx,
  } = useWallet();

  const {
    txState,
    txHash,
    error: txError,
    errorCode: txErrorCode,
    sendTransaction,
    invokeContract,
    resetTxState,
  } = useTransaction();

  const [pendingTx, setPendingTx] = useState(null);

  const handleInitiatePayment = (destination, amount, memo) => {
    setPendingTx({ destination, amount, memo });
  };

  const handleConfirmPayment = () => {
    if (!pendingTx) return;
    const { destination, amount, memo } = pendingTx;
    setPendingTx(null);
    sendTransaction(publicKey, destination, amount, memo, signTx, () => {
      // Auto-refresh balance and activity after successful payment
      refreshBalance(publicKey);
    });
  };

  const handleCancelPayment = () => {
    setPendingTx(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D0F1A] to-[#111326] text-textPrimary flex flex-col items-center selection:bg-primary/30 relative overflow-hidden bg-grid">

      {/* Sticky top navbar */}
      <Navbar
        publicKey={publicKey}
        isDemoMode={isDemoMode}
        disconnectWallet={disconnectWallet}
      />

      {/* Main dashboard content */}
      <div className="w-full max-w-[1140px] px-4 md:px-8 py-8 md:py-12 z-10 animate-fadeIn">
        {/* Banner hero header */}
        <header className="mb-8 md:mb-10 text-left">
          <h2 className="text-xl md:text-2xl font-bold font-space text-textPrimary tracking-tight">
            ⭐ StellarPay
          </h2>
          <p className="text-xs text-textMuted/80 mt-1 max-w-[500px] leading-relaxed">
            Send XLM instantly on Stellar Testnet & Interact with Smart Contracts
          </p>
        </header>

        {/* 12-column responsive dashboard grid */}
        <main className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Wallet Status (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <WalletCard
              publicKey={publicKey}
              balance={balance}
              isInstalled={isInstalled}
              isDemoMode={isDemoMode}
              loading={walletLoading}
              error={walletError}
              connectWallet={connectWallet}
              connectDemoWallet={connectDemoWallet}
              disconnectWallet={disconnectWallet}
              refreshBalance={refreshBalance}
              fundAccount={fundAccount}
            />
            {publicKey && (
              <ContractPanel
                publicKey={publicKey}
                signTx={signTx}
                invokeContract={invokeContract}
                txState={txState}
                refreshBalance={refreshBalance}
              />
            )}
          </div>
          
          {/* Right Column: Send Form, Ledger Activity & Results (7 columns) */}
          <div className="lg:col-span-7 space-y-6">
            <SendForm
              senderPublicKey={publicKey}
              balance={balance}
              onSubmit={handleInitiatePayment}
              loading={txState === 'loading'}
            />
            
            <TransactionResult
              txState={txState}
              txHash={txHash}
              error={txError}
              errorCode={txErrorCode}
              onClose={resetTxState}
            />

            <ActivityLog
              publicKey={publicKey}
              activity={activity}
              loading={activityLoading}
            />
          </div>
        </main>
        
        {/* Footer */}
        <footer className="mt-12 md:mt-16 pt-6 border-t border-borderColor/25 text-center text-xs text-[#8B93B0] leading-normal tracking-wide">
          <p>Built with ❤️ on Stellar Testnet · StellarPay © 2025</p>
        </footer>
      </div>

      {/* Confirmation Overlay Modal */}
      <TransactionConfirmModal
        isOpen={!!pendingTx}
        txDetails={pendingTx}
        isDemoMode={isDemoMode}
        onConfirm={handleConfirmPayment}
        onCancel={handleCancelPayment}
      />
    </div>
  );
}

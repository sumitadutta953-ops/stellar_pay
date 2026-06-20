import React, { useState } from 'react';
import { useWallet } from '@/hooks/useWallet';
import { useSendPayment } from '@/hooks/usePayments';
import { useTransaction } from '@/hooks/useTransaction';
import { Card, CardHeader } from '@/components/Common/Card';
import { Button } from '@/components/Common/Button';
import { Modal } from '@/components/Common/Modal';
import { validatePaymentForm } from '@/utils/validation';
import type { PaymentFormData } from '@/types/payment';

const INITIAL: PaymentFormData = { destination: '', amount: '', memo: '' };

export function PaymentForm() {
  const { publicKey, balance, isDemoMode } = useWallet();
  const { txState, txHash, error: txError, resetTxState } = useTransaction();
  const { mutate: sendPayment, isPending } = useSendPayment();

  const [form, setForm] = useState<PaymentFormData>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm] = useState(false);

  const isLoading = isPending || txState === 'loading';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
  };

  const handleUseMax = () => {
    const max = Math.max(0, parseFloat(balance) - 0.01).toFixed(7);
    setForm(prev => ({ ...prev, amount: max }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validatePaymentForm(form.destination, form.amount, form.memo);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    sendPayment(form, {
      onSuccess: () => {
        setForm(INITIAL);
        setErrors({});
      },
    });
  };

  if (!publicKey) {
    return (
      <Card id="send-xlm-card">
        <CardHeader title="Send XLM" icon="↑" />
        <div className="p-5 text-center py-10">
          <p className="text-sm text-[#9CA3AF]">Connect your wallet to send XLM.</p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card id="send-xlm-card">
        <CardHeader title="Send XLM" icon="↑" subtitle="Stellar Testnet" />
        <form onSubmit={handleSubmit} className="p-5 space-y-4" noValidate>
          {/* Destination */}
          <div>
            <label htmlFor="destination" className="block text-xs text-[#9CA3AF] mb-1.5 font-medium">
              Recipient Address
            </label>
            <input
              id="destination"
              name="destination"
              type="text"
              placeholder="Enter Stellar address (G...)"
              value={form.destination}
              onChange={handleChange}
              className={`w-full bg-black/30 border rounded-xl px-3 py-2.5 text-sm text-[#F9FAFB] placeholder-[#4B5563] font-mono focus:outline-none focus:ring-1 transition-colors ${
                errors.destination
                  ? 'border-[#E11D48]/60 focus:ring-[#E11D48]/40'
                  : 'border-[rgba(123,97,255,0.2)] focus:ring-[#7B61FF]/40 focus:border-[#7B61FF]/50'
              }`}
            />
            {errors.destination && (
              <p className="mt-1 text-[11px] text-[#E11D48]">{errors.destination}</p>
            )}
          </div>

          {/* Amount */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label htmlFor="amount" className="text-xs text-[#9CA3AF] font-medium">
                Amount (XLM)
              </label>
              <button
                type="button"
                onClick={handleUseMax}
                className="text-[10px] text-[#7B61FF] hover:text-[#9B81FF] font-medium transition-colors"
              >
                USE MAX
              </button>
            </div>
            <div className="relative">
              <input
                id="amount"
                name="amount"
                type="number"
                min="0.0000001"
                step="any"
                placeholder="0.0000000"
                value={form.amount}
                onChange={handleChange}
                className={`w-full bg-black/30 border rounded-xl px-3 py-2.5 text-sm text-[#F9FAFB] placeholder-[#4B5563] font-mono focus:outline-none focus:ring-1 transition-colors pr-16 ${
                  errors.amount
                    ? 'border-[#E11D48]/60 focus:ring-[#E11D48]/40'
                    : 'border-[rgba(123,97,255,0.2)] focus:ring-[#7B61FF]/40 focus:border-[#7B61FF]/50'
                }`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7B61FF]">
                XLM
              </span>
            </div>
            {errors.amount && (
              <p className="mt-1 text-[11px] text-[#E11D48]">{errors.amount}</p>
            )}
          </div>

          {/* Memo */}
          <div>
            <div className="flex justify-between mb-1.5">
              <label htmlFor="memo" className="text-xs text-[#9CA3AF] font-medium">
                Memo (optional)
              </label>
              <span className="text-[10px] text-[#6B7280]">{form.memo.length}/28</span>
            </div>
            <input
              id="memo"
              name="memo"
              type="text"
              maxLength={28}
              placeholder="Max 28 characters"
              value={form.memo}
              onChange={handleChange}
              className={`w-full bg-black/30 border rounded-xl px-3 py-2.5 text-sm text-[#F9FAFB] placeholder-[#4B5563] focus:outline-none focus:ring-1 transition-colors ${
                errors.memo
                  ? 'border-[#E11D48]/60 focus:ring-[#E11D48]/40'
                  : 'border-[rgba(123,97,255,0.2)] focus:ring-[#7B61FF]/40 focus:border-[#7B61FF]/50'
              }`}
            />
            {errors.memo && <p className="mt-1 text-[11px] text-[#E11D48]">{errors.memo}</p>}
          </div>

          {/* Error from TX */}
          {txState === 'failure' && txError && (
            <div className="p-3 rounded-xl bg-[#E11D48]/8 border border-[#E11D48]/25 text-xs text-[#E11D48] flex justify-between items-start gap-2">
              <span>{txError}</span>
              <button
                type="button"
                onClick={resetTxState}
                className="shrink-0 font-bold hover:opacity-70"
              >
                ✕
              </button>
            </div>
          )}

          {/* Success */}
          {txState === 'success' && txHash && (
            <div className="p-3 rounded-xl bg-[#10B981]/8 border border-[#10B981]/25 text-xs text-[#10B981] space-y-1">
              <p className="font-semibold">✓ Payment sent!</p>
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] break-all hover:underline"
              >
                {txHash}
              </a>
            </div>
          )}

          <Button
            id="send-xlm-btn"
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
          >
            {isDemoMode ? '🎭 Send (Demo)' : '↑ Send XLM'}
          </Button>
        </form>
      </Card>

      {/* Confirm Modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Transaction">
        <div className="space-y-4">
          <div className="bg-black/30 rounded-xl p-4 text-center">
            <p className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Amount</p>
            <p className="text-2xl font-extrabold text-[#F9FAFB] mt-1">
              {parseFloat(form.amount || '0').toFixed(7)}{' '}
              <span className="text-sm text-[#7B61FF] font-bold">XLM</span>
            </p>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="text-[#9CA3AF]">To</span>
              <span className="font-mono text-[#F9FAFB] text-right max-w-[200px] break-all">
                {form.destination}
              </span>
            </div>
            {form.memo && (
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#9CA3AF]">Memo</span>
                <span className="text-[#F9FAFB]">{form.memo}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#9CA3AF]">Network</span>
              <span className="text-[#F9FAFB]">Stellar Testnet</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowConfirm(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirm} id="confirm-send-btn">
              Confirm & Sign
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

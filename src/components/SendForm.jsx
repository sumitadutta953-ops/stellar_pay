import React, { useState, useEffect } from 'react';
import { validateDestinationAddress, validateAmount, validateMemo } from '../utils/validation';

export default function SendForm({
  senderPublicKey,
  balance,
  onSubmit,
  loading,
}) {
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    const newErrors = {};
    if (touched.destination) {
      const destErr = validateDestinationAddress(destination);
      if (destErr) newErrors.destination = destErr;
    }
    if (touched.amount) {
      const amtErr = validateAmount(amount, balance);
      if (amtErr) newErrors.amount = amtErr;
    }
    if (touched.memo) {
      const memoErr = validateMemo(memo);
      if (memoErr) newErrors.memo = memoErr;
    }
    setErrors(newErrors);
  }, [destination, amount, memo, balance, touched]);

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const allTouched = { destination: true, amount: true, memo: true };
    setTouched(allTouched);

    const destErr = validateDestinationAddress(destination);
    const amtErr = validateAmount(amount, balance);
    const memoErr = validateMemo(memo);

    const newErrors = {};
    if (destErr) newErrors.destination = destErr;
    if (amtErr) newErrors.amount = amtErr;
    if (memoErr) newErrors.memo = memoErr;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit(destination, amount, memo);
    }
  };

  const formContent = (
    <div className="space-y-5">
      <h2 className="text-xs font-bold text-textMuted uppercase tracking-widest font-space flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
        Send XLM
      </h2>

      {/* Destination Address */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="destination" className="text-[10px] text-textMuted font-bold uppercase tracking-wider block font-space">
            Recipient Address
          </label>
        </div>
        <div className="relative">
          <input
            id="destination"
            type="text"
            placeholder="Enter Stellar address (G...)"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            onBlur={() => handleBlur('destination')}
            disabled={loading || !senderPublicKey}
            className={`w-full px-3.5 py-3 bg-[#111322] border rounded-xl text-xs text-textPrimary font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 ${
              errors.destination ? 'border-error/60 focus:ring-error/30 focus:border-error' : 'border-borderColor'
            }`}
          />
        </div>
        {errors.destination && (
          <p className="text-[10px] text-error font-semibold flex items-center gap-1 mt-1 animate-scale">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errors.destination}</span>
          </p>
        )}
      </div>

      {/* Amount in XLM */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="amount" className="text-[10px] text-textMuted font-bold uppercase tracking-wider block font-space">
            Amount (XLM)
          </label>
          {balance !== null && senderPublicKey && (
            <button
              type="button"
              onClick={() => {
                // Buffer 0.00001 for fee
                const maxAmt = Math.max(0, parseFloat(balance) - 0.00001);
                setAmount(maxAmt.toFixed(7));
                setTouched(prev => ({ ...prev, amount: true }));
              }}
              className="text-[9px] text-primary hover:text-primary/80 font-bold uppercase tracking-wider transition-colors font-space"
            >
              Use Max
            </button>
          )}
        </div>
        <div className="relative">
          <input
            id="amount"
            type="text"
            placeholder="0.0000000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onBlur={() => handleBlur('amount')}
            disabled={loading || !senderPublicKey}
            className={`w-full px-3.5 py-3 bg-[#111322] border rounded-xl text-xs text-textPrimary font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 pr-12 ${
              errors.amount ? 'border-error/60 focus:ring-error/30 focus:border-error' : 'border-borderColor'
            }`}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-textMuted/70 font-space select-none">
            XLM
          </span>
        </div>
        {errors.amount && (
          <p className="text-[10px] text-error font-semibold flex items-center gap-1 mt-1 animate-scale">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errors.amount}</span>
          </p>
        )}
      </div>

      {/* Optional Memo */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <label htmlFor="memo" className="text-[10px] text-textMuted font-bold uppercase tracking-wider block font-space">
            Memo (Optional)
          </label>
          <span className="text-[9px] font-mono text-textMuted/50">
            {memo.length}/28
          </span>
        </div>
        <input
          id="memo"
          type="text"
          placeholder="Max 28 characters"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          onBlur={() => handleBlur('memo')}
          disabled={loading || !senderPublicKey}
          maxLength={28}
          className={`w-full px-3.5 py-3 bg-[#111322] border rounded-xl text-xs text-textPrimary focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200 ${
            errors.memo ? 'border-error/60 focus:ring-error/30 focus:border-error' : 'border-borderColor'
          }`}
        />
        {errors.memo && (
          <p className="text-[10px] text-error font-semibold flex items-center gap-1 mt-1 animate-scale">
            <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{errors.memo}</span>
          </p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading || !senderPublicKey || Object.keys(errors).length > 0}
        className="w-full py-3.5 bg-[#7B61FF] hover:bg-[#6A50EE] disabled:opacity-50 text-textPrimary font-bold rounded-xl transition-all duration-250 shadow-lg shadow-[#7B61FF]/15 hover:shadow-[#7B61FF]/25 flex items-center justify-center gap-2 mt-2 text-xs font-space"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Submitting to Ledger...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Send XLM →</span>
          </>
        )}
      </button>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-[28px] shadow-2xl relative overflow-hidden">
      {/* Blurred blocked layout if disconnected */}
      {!senderPublicKey ? (
        <>
          {/* Blurred form backdrop visual */}
          <div className="opacity-20 select-none pointer-events-none filter blur-[1.5px]">
            {formContent}
          </div>
          
          {/* Glass Overlay Card */}
          <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10 animate-fadeIn">
            <div className="w-11 h-11 rounded-2xl bg-[#1C1F35] border border-borderColor flex items-center justify-center text-textMuted/60 mb-3.5 shadow-lg">
              <svg className="w-5 h-5 text-textMuted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xs font-bold text-textPrimary uppercase tracking-widest font-space">
              Connection Required
            </h3>
            <p className="text-textMuted text-xs mt-1.5 max-w-[280px] leading-relaxed">
              Connect your Freighter extension or spin up a Demo Simulator above to access the payment terminal.
            </p>
          </div>
        </>
      ) : (
        formContent
      )}
    </form>
  );
}

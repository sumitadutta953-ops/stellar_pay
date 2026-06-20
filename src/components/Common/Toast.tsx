import React from 'react';
import { useUiStore, type Toast } from '@/store/uiStore';

const typeStyles: Record<Toast['type'], string> = {
  success: 'border-l-[#10B981] bg-[#10B981]/10 text-[#10B981]',
  error: 'border-l-[#E11D48] bg-[#E11D48]/10 text-[#E11D48]',
  warning: 'border-l-amber-500 bg-amber-500/10 text-amber-400',
  info: 'border-l-[#7B61FF] bg-[#7B61FF]/10 text-[#7B61FF]',
};

const typeIcons: Record<Toast['type'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

function ToastItem({ toast }: { toast: Toast }) {
  const removeToast = useUiStore(s => s.removeToast);
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border-l-2 shadow-xl backdrop-blur-md min-w-[280px] max-w-[360px] ${typeStyles[toast.type]} animate-fadeIn`}
      role="alert"
    >
      <span className="font-bold text-sm mt-0.5 shrink-0">{typeIcons[toast.type]}</span>
      <p className="text-sm text-[#F9FAFB] leading-snug flex-1">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors shrink-0 mt-0.5"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  );
}

export function ToastContainer() {
  const toasts = useUiStore(s => s.toasts);
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} />
        </div>
      ))}
    </div>
  );
}

import React, { useEffect } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-md' }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(8,10,17,0.85)' }}
      onClick={onClose}
    >
      <div
        className={`relative w-full ${maxWidth} rounded-2xl border border-[rgba(123,97,255,0.2)] bg-[#0D0F1A] shadow-2xl p-6 animate-scale`}
        onClick={e => e.stopPropagation()}
      >
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-[#7B61FF]/8 rounded-full blur-3xl pointer-events-none" />
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold text-[#F9FAFB] tracking-wide">{title}</h3>
          <button
            onClick={onClose}
            className="text-[#9CA3AF] hover:text-[#F9FAFB] transition-colors p-1 rounded-lg hover:bg-white/5"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

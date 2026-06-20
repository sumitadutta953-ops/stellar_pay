import React from 'react';

export function Footer() {
  return (
    <footer className="mt-12 md:mt-16 pt-6 border-t border-[rgba(123,97,255,0.1)] text-center text-xs text-[#4B5563] leading-relaxed">
      <p>
        Built with ❤️ on Stellar Testnet ·{' '}
        <span className="text-[#7B61FF]">StellarPay Pro</span> © 2025 · Level 3 Orange Belt
      </p>
      <p className="mt-1 text-[10px]">
        Powered by Soroban Smart Contracts · React 18 · TypeScript · Zustand · TanStack Query
      </p>
    </footer>
  );
}

import React from 'react';

export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' }[size];
  return (
    <span
      className={`${sizeClass} rounded-full border-2 border-[#7B61FF]/30 border-t-[#7B61FF] animate-spin inline-block`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function SkeletonLine({ className = '' }: { className?: string }) {
  return (
    <div
      className={`bg-[#1C1F35] rounded animate-pulse ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[rgba(123,97,255,0.12)] bg-[rgba(15,17,30,0.75)] p-5 space-y-3">
      <SkeletonLine className="h-3 w-24" />
      <SkeletonLine className="h-8 w-40" />
      <SkeletonLine className="h-3 w-32" />
    </div>
  );
}

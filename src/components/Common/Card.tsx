import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  id?: string;
}

export function Card({ children, className = '', glow = false, id }: CardProps) {
  return (
    <div
      id={id}
      className={`relative rounded-2xl border border-[rgba(123,97,255,0.12)] bg-[rgba(15,17,30,0.75)] backdrop-blur-md shadow-xl overflow-hidden ${glow ? 'shadow-[#7B61FF]/10' : ''} ${className}`}
    >
      {glow && (
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-[#7B61FF]/8 rounded-full blur-3xl pointer-events-none" />
      )}
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[rgba(123,97,255,0.08)]">
      <div className="flex items-center gap-2">
        {icon && <span className="text-base">{icon}</span>}
        <div>
          <h3 className="text-xs font-bold text-[#9CA3AF] uppercase tracking-widest">{title}</h3>
          {subtitle && <p className="text-[10px] text-[#6B7280] mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

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
      className={`relative glass-card rounded-2xl overflow-hidden ${glow ? 'shadow-purple-500/10' : ''} ${className}`}
    >
      {glow && (
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none mix-blend-screen" />
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
    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5 bg-slate-900/20">
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl drop-shadow-md">{icon}</span>}
        <div>
          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-[0.2em]">{title}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}


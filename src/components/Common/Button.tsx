import React from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500 hover:from-indigo-400 hover:via-purple-400 hover:to-fuchsia-400 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0 disabled:active:scale-100 disabled:shadow-none',
  secondary:
    'bg-slate-900/60 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700/50 hover:border-slate-500/50 text-slate-100 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0 disabled:active:scale-100 shadow-xl shadow-black/20',
  ghost:
    'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-100 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0 disabled:active:scale-100',
  danger:
    'bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-500 hover:text-rose-400 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40 disabled:hover:translate-y-0 disabled:active:scale-100',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
};

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  children,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`font-semibold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
    </button>
  );
}

// conventional spacing comment for commit spacing

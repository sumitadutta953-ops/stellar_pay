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
    'bg-[#7B61FF] hover:bg-[#6B51EF] text-white shadow-lg shadow-[#7B61FF]/20 disabled:opacity-40',
  secondary:
    'bg-[#1C1F35] hover:bg-[#252A47] border border-[rgba(123,97,255,0.2)] text-[#F9FAFB] disabled:opacity-40',
  ghost:
    'bg-transparent hover:bg-[#1C1F35] text-[#9CA3AF] hover:text-[#F9FAFB] disabled:opacity-40',
  danger:
    'bg-[#E11D48]/10 hover:bg-[#E11D48]/20 border border-[#E11D48]/30 text-[#E11D48] disabled:opacity-40',
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

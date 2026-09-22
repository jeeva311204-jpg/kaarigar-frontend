import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'turmeric';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  // Mobile-first accessible tap targets: min 48px height for md & lg
  let baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 tap-target-accessible select-none cursor-pointer';

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      // Terracotta clay accent with tactile press effect
      variantStyles = 'bg-terracotta-500 hover:bg-terracotta-600 text-white shadow-sm hover:shadow-craft border border-terracotta-600 focus:ring-terracotta-400 font-semibold';
      break;
    case 'secondary':
      // Deep Indigo structure
      variantStyles = 'bg-indigo-900 hover:bg-indigo-950 text-white shadow-sm hover:shadow-craft border border-indigo-950 focus:ring-indigo-700 font-semibold';
      break;
    case 'turmeric':
      // Turmeric gold
      variantStyles = 'bg-turmeric-500 hover:bg-turmeric-600 text-white shadow-sm hover:shadow-craft border border-turmeric-600 focus:ring-turmeric-400 font-semibold';
      break;
    case 'outline':
      variantStyles = 'bg-paper-100 hover:bg-paper-200 text-indigo-950 border border-paper-300 hover:border-paper-400 focus:ring-indigo-700 shadow-sm';
      break;
    case 'ghost':
      variantStyles = 'bg-transparent hover:bg-paper-200 text-indigo-900 focus:ring-indigo-700';
      break;
  }

  let sizeStyles = '';
  switch (size) {
    case 'sm':
      sizeStyles = 'px-3.5 py-2 text-xs min-h-[40px] gap-1.5';
      break;
    case 'md':
      sizeStyles = 'px-5 py-3 text-sm min-h-[48px] gap-2';
      break;
    case 'lg':
      sizeStyles = 'px-6 py-3.5 text-base min-h-[52px] gap-2.5 font-semibold';
      break;
  }

  const disabledStyles = (disabled || isLoading) 
    ? 'opacity-50 cursor-not-allowed pointer-events-none' 
    : '';

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${disabledStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

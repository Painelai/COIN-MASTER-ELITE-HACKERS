
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-2xl font-display font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50 active:scale-95 uppercase tracking-widest',
  {
    variants: {
      variant: {
        primary: 'bg-brand-600 text-white hover:bg-brand-500 shadow-neon hover:shadow-neon-strong',
        secondary: 'bg-slate-800 text-slate-200 border border-white/5 hover:bg-slate-700',
        outline: 'border-2 border-brand-500 bg-transparent text-brand-400 hover:bg-brand-500/10',
        danger: 'bg-red-600 text-white hover:bg-red-500 shadow-lg',
        ghost: 'hover:bg-white/5 text-slate-400 hover:text-white',
      },
      size: {
        sm: 'h-9 px-4 text-[10px]',
        md: 'h-12 px-6 text-xs',
        lg: 'h-14 px-8 text-sm',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            Sincronizando...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

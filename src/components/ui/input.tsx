import * as React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: boolean;
  size?: 'default' | 'sm';
}

function Input({ className, type, error, size: inputSize = 'default', ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        'flex w-full rounded-[var(--radius)] border bg-[var(--bg-surface)] transition-all',
        'placeholder:text-[var(--text-tertiary)]',
        'hover:border-[var(--accent)]',
        'focus:border-[var(--accent)] focus:shadow-[var(--focus-ring)] focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[var(--bg-page)]',
        'read-only:bg-[var(--bg-subtle)] read-only:cursor-default',
        inputSize === 'sm' ? 'h-8 px-2.5 text-xs' : 'h-9 px-3 text-[13px]',
        error
          ? 'border-[var(--error)] hover:border-[var(--error)] focus:border-[var(--error)] focus:shadow-[0_0_0_2px_rgba(255,77,79,0.1)]'
          : 'border-[var(--border-input)]',
        className
      )}
      {...props}
    />
  );
}

export { Input };

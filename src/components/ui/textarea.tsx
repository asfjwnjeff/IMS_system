import * as React from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

function Textarea({ className, error, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      className={cn(
        'flex min-h-[80px] w-full rounded-[var(--radius)] border bg-[var(--bg-surface)] px-3 py-2 text-[13px] transition-all',
        'placeholder:text-[var(--text-tertiary)]',
        'hover:border-[var(--accent)]',
        'focus:border-[var(--accent)] focus:shadow-[var(--focus-ring)] focus:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error
          ? 'border-[var(--error)] hover:border-[var(--error)] focus:border-[var(--error)]'
          : 'border-[var(--border-input)]',
        className
      )}
      {...props}
    />
  );
}

export { Textarea };

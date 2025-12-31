import React from 'react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

// ============================================================================
// Component
// ============================================================================

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="mb-1.5 block text-sm font-medium text-slate-700">
            {label}
            {props.required && <span className="ml-1 text-danger-500">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'flex min-h-[100px] w-full rounded-lg border bg-white px-3 py-2 text-sm',
            'placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-50',
            'resize-y',
            error
              ? 'border-danger-500 focus:ring-danger-500'
              : 'border-slate-300 focus:ring-primary-500',
            className
          )}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-danger-600">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-sm text-slate-500">{hint}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

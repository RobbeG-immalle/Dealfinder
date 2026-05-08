import * as React from 'react';
import { cn } from '@/lib/utils';

interface ToastProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'destructive';
  title?: string;
  description?: string;
  onDismiss?: () => void;
}

function Toast({ className, variant = 'default', title, description, onDismiss, ...props }: ToastProps) {
  return (
    <div
      className={cn(
        'pointer-events-auto relative flex w-full items-center justify-between overflow-hidden rounded-md border p-6 pr-8 shadow-lg',
        variant === 'destructive'
          ? 'border-red-500 bg-red-600 text-white'
          : 'border-border bg-background text-foreground',
        className,
      )}
      {...props}
    >
      <div className="grid gap-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="absolute right-2 top-2 p-1 opacity-70 hover:opacity-100">
          ✕
        </button>
      )}
    </div>
  );
}

export { Toast };

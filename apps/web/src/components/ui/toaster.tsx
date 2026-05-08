'use client';

import * as React from 'react';
import { useToast } from './use-toast';
import type { Toast } from './use-toast';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(({ id, title, description, variant, onDismiss }: Toast & { onDismiss?: () => void }) => (
        <div
          key={id}
          className={cn(
            'group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all mb-2',
            variant === 'destructive'
              ? 'border-red-500 bg-red-600 text-white'
              : 'border-border bg-background text-foreground',
          )}
        >
          <div className="grid gap-1">
            {title && <div className="text-sm font-semibold">{title}</div>}
            {description && <div className="text-sm opacity-90">{description}</div>}
          </div>
          <button
            onClick={onDismiss}
            className="absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

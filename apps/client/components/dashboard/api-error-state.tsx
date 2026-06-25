'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';
import { formatApiError } from '@/lib/api/errors';

type ApiErrorStateProps = {
  error: unknown;
  fallback?: string;
  onRetry?: () => void;
  className?: string;
};

export function ApiErrorState({
  error,
  fallback = 'Failed to load data. Please try again.',
  onRetry,
  className = 'py-20',
}: ApiErrorStateProps) {
  const message = formatApiError(error, { fallback });

  return (
    <div className={`flex flex-col items-center justify-center gap-2 text-ink-60 ${className}`}>
      <AlertTriangle className="h-6 w-6 text-amber" aria-hidden />
      <p className="max-w-md text-center text-sm">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-teal-700 hover:underline"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </button>
      )}
    </div>
  );
}

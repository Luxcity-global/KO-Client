import { Suspense } from 'react';
import { VerifyPageClient } from './verify-page-client';

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-ink-60">
          Loading…
        </div>
      }
    >
      <VerifyPageClient />
    </Suspense>
  );
}

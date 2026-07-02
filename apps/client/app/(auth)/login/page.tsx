import { Suspense } from 'react';
import { LoginPageClient } from './login-page-client';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-ink-60">
          Loading…
        </div>
      }
    >
      <LoginPageClient />
    </Suspense>
  );
}

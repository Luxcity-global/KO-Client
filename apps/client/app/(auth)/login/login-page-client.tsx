'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn } from 'lucide-react';
import { PortalLoginForm } from '@/components/auth/portal-login-form';
import {
  clearMockPortalSession,
  setPortalSignedIn,
  usePortalAuth,
} from '@/components/portal-auth-provider';
import { loginPortal } from '@/lib/api/portal-data';
import { formatApiError } from '@/lib/api/errors';
import { markAccountConfigured } from '@/lib/api/invite-context';

export function LoginPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const { isSignedIn, isLoaded } = usePortalAuth();
  const redirectUrl = searchParams.get('redirect_url') ?? '/overview';

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    router.replace(redirectUrl);
  }, [isLoaded, isSignedIn, redirectUrl, router]);

  async function handleSubmit(email: string, password: string) {
    setError(null);
    setLoading(true);

    try {
      clearMockPortalSession();
      await loginPortal(email.trim(), password);
      markAccountConfigured(email.trim());
      setPortalSignedIn();
      queryClient.clear();
      router.replace(redirectUrl);
      router.refresh();
    } catch (err) {
      setError(formatApiError(err, { fallback: 'Login failed. Please check your credentials.' }));
    } finally {
      setLoading(false);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-ink-60">
        Loading…
      </div>
    );
  }

  if (isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-ink-60">
        Redirecting…
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md rounded-2xl border border-ink-08 bg-white p-8 shadow-lg">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-teal-50 text-brand-teal-700">
          <LogIn className="h-6 w-6" aria-hidden />
        </div>
        <h1 className="text-center font-heading text-2xl font-bold text-ink">Sign in to your portal</h1>
        <p className="mt-2 text-center text-sm text-ink-60">
          Enter the email and password you set up when you received your invite.
        </p>

        <div className="mt-8">
          <PortalLoginForm
            loading={loading}
            error={error}
            mockHint={false}
            onSubmit={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}

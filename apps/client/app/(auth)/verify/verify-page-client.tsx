'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function VerifyPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const qs = token ? `?token=${encodeURIComponent(token)}` : '';
    router.replace(`/invite${qs}`);
  }, [router, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-ink-60">
      Redirecting…
    </div>
  );
}

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { usePortalAuth } from '@/components/portal-auth-provider';

export { setMockPortalSession } from '@/components/portal-auth-provider';

export function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = usePortalAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      const redirect = encodeURIComponent(pathname);
      router.replace(`/login?redirect_url=${redirect}`);
    }
  }, [isLoaded, isSignedIn, pathname, router]);

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-ink-60">
        Loading…
      </div>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return <>{children}</>;
}

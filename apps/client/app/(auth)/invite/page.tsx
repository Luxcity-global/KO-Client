import { Suspense } from 'react';
import { InvitePageClient } from './invite-page-client';

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-ink-60">
          Loading invite…
        </div>
      }
    >
      <InvitePageClient />
    </Suspense>
  );
}

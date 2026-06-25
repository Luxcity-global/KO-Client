import { Suspense } from 'react';
import MessagesPageClient from './messages-page-client';

export default function MessagesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-ink-60">Loading messages…</p>}>
      <MessagesPageClient />
    </Suspense>
  );
}

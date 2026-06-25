'use client';

import { FactFindWizard } from '@/components/fact-find/fact-find-wizard';
import { usePortalSession } from '@/hooks/use-portal-session';
import { ApiErrorState } from '@/components/dashboard/api-error-state';

export default function ApplicationPage() {
  const { data: session, isLoading, error, refetch } = usePortalSession();

  if (isLoading) {
    return <p className="text-sm text-ink-60">Loading your application…</p>;
  }

  if (error || !session) {
    return <ApiErrorState error={error} onRetry={() => refetch()} />;
  }

  return (
    <div className="-m-4 min-h-[calc(100dvh-0px)] md:-m-8">
      <FactFindWizard
      caseId={session.case.id}
      caseReference={session.case.referenceNumber}
      prefill={{
        firstName: session.client.firstName,
        lastName: session.client.lastName,
        email: session.client.email,
      }}
    />
    </div>
  );
}

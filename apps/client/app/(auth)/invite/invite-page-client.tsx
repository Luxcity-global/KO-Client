'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import {
  InviteFlowModals,
  type InviteFlowStep,
} from '@/components/auth/invite-flow-modals';
import { ClientDashboardShell } from '@/components/dashboard/client-dashboard-shell';
import { FactFindWizard } from '@/components/fact-find/fact-find-wizard';
import { usePortalAuth } from '@/components/portal-auth-provider';
import { validateInviteToken, type InviteValidation } from '@/lib/api/portal-data';

function getInitialInviteStep(invite: InviteValidation): InviteFlowStep {
  return invite.accountConfigured ? 'login' : 'welcome';
}

export function InvitePageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isSignedIn, isLoaded } = usePortalAuth();
  const token = searchParams.get('token');

  const [invite, setInvite] = useState<InviteValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<InviteFlowStep>('welcome');

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    }
  }, [token, router]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace('/overview');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!token) return;

    validateInviteToken(token)
      .then((validation) => {
        setInvite(validation);
        setStep(getInitialInviteStep(validation));
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Invalid invite link'));
  }, [token]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-ink-60">
        Redirecting to sign in…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface p-4">
        <div className="max-w-md rounded-xl border border-ink-08 bg-white p-8 text-center">
          <h1 className="font-heading text-xl font-bold text-ink">Invite link invalid</h1>
          <p className="mt-2 text-sm text-ink-60">{error}</p>
          <p className="mt-4 text-sm text-ink-60">
            Please contact your mortgage adviser to request a new invite link.
          </p>
        </div>
      </div>
    );
  }

  if (!invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface text-sm text-ink-60">
        Loading invite…
      </div>
    );
  }

  return (
    <>
      <ClientDashboardShell>
        <div className={`-m-4 md:-m-8 ${step !== 'verified' ? 'opacity-40 blur-[1px]' : 'opacity-40 blur-[1px]'}`}>
          <FactFindWizard
            caseId={invite.case.id}
            caseReference={invite.case.referenceNumber}
            prefill={{
              firstName: invite.client.firstName,
              lastName: invite.client.lastName,
              email: invite.client.email,
            }}
            preview
          />
        </div>
      </ClientDashboardShell>
      <InviteFlowModals
        invite={invite}
        token={token}
        step={step}
        onStepChange={setStep}
        onVerified={() => setStep('verified')}
      />
    </>
  );
}

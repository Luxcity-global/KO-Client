'use client';

import { ApplicationProgressStepper } from '@/components/dashboard/application-progress-stepper';
import { AdviserContactCard } from '@/components/dashboard/adviser-contact-card';
import { ApiErrorState } from '@/components/dashboard/api-error-state';
import { NextStepsCard } from '@/components/dashboard/next-steps-card';
import { usePortalSession } from '@/hooks/use-portal-session';

function formatGreetingDate(date: Date) {
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
    .format(date)
    .toUpperCase();
}

function greetingForHour(hour: number) {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function OverviewPage() {
  const { data, isLoading, error, refetch } = usePortalSession();
  const now = new Date();

  if (isLoading) {
    return <p className="text-sm text-ink-60">Loading your dashboard…</p>;
  }

  if (error || !data) {
    return <ApiErrorState error={error} onRetry={() => refetch()} />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header>
        <p className="text-xs font-medium tracking-widest text-ink-60">{formatGreetingDate(now)}</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-ink md:text-4xl">
          {greetingForHour(now.getHours())}, {data.client.firstName}.
        </h1>
      </header>

      <ApplicationProgressStepper steps={data.progressSteps} />

      <div className="grid gap-6 lg:grid-cols-2">
        <NextStepsCard tasks={data.tasks} />
        <AdviserContactCard adviser={data.adviser} />
      </div>
    </div>
  );
}

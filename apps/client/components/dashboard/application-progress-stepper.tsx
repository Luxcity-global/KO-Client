import type { PortalProgressStep, ProgressStepStatus } from '@/lib/api/portal-data';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type ApplicationProgressStepperProps = {
  steps: PortalProgressStep[];
};

function deriveOverallStatus(steps: PortalProgressStep[]): ProgressStepStatus | null {
  if (steps.every((s) => s.status === 'completed')) return 'completed';
  if (steps.some((s) => s.status === 'in_progress')) return 'in_progress';
  return null;
}

function StepCircle({ status }: { status: ProgressStepStatus }) {
  return (
    <div
      className={cn(
        'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2',
        status === 'completed' && 'border-brand-teal-700 bg-brand-teal-700 text-white',
        status === 'in_progress' && 'border-brand-teal-500 bg-white',
        status === 'pending' && 'border-ink-20 bg-white',
      )}
    >
      {status === 'completed' ? (
        <Check className="h-5 w-5" aria-hidden />
      ) : status === 'in_progress' ? (
        <span className="h-2.5 w-2.5 rounded-full bg-brand-teal-500" />
      ) : null}
    </div>
  );
}

export function ApplicationProgressStepper({ steps }: ApplicationProgressStepperProps) {
  const overallStatus = deriveOverallStatus(steps);

  return (
    <div className="rounded-xl border border-ink-08 bg-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-heading text-lg font-semibold text-ink">Application Progress</h2>
        {overallStatus === 'in_progress' && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber/30 bg-amber/10 px-3 py-1 text-xs font-medium text-amber">
            <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden />
            In Progress
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-ink-60">
        Track where your mortgage application stands right now
      </p>

      {/* Mobile: vertical stepper */}
      <ol className="mt-6 sm:hidden" aria-label="Application progress steps">
        {steps.map((step, index) => (
          <li key={step.label} className="relative flex items-start gap-4">
            {/* Vertical connector line (not on last item) */}
            {index < steps.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[19px] top-10 bottom-0 w-0.5',
                  step.status === 'completed' ? 'bg-brand-teal-500' : 'bg-ink-20',
                )}
              />
            )}

            {/* Circle indicator */}
            <div className="relative z-10">
              <StepCircle status={step.status} />
            </div>

            {/* Step label */}
            <div className={cn('pb-6', index === steps.length - 1 && 'pb-0')}>
              <p
                className={cn(
                  'pt-2 text-sm font-medium leading-tight',
                  step.status === 'pending' ? 'text-ink-60' : 'text-ink',
                )}
              >
                {step.label}
              </p>
              {step.status === 'in_progress' && (
                <p className="mt-0.5 text-xs font-medium text-brand-teal-500">In progress</p>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Desktop: horizontal stepper */}
      <ol
        className="mt-6 hidden sm:flex sm:items-start sm:justify-between"
        aria-label="Application progress steps"
      >
        {steps.map((step, index) => (
          <li key={step.label} className="flex flex-1 flex-col items-center gap-2 text-center">
            <StepCircle status={step.status} />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-60">
                Step {index + 1}
              </p>
              <p className="text-sm font-medium text-ink">{step.label}</p>
              {step.status === 'in_progress' && (
                <p className="mt-1 text-xs font-medium text-brand-teal-700">In progress</p>
              )}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

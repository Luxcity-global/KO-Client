import type { PortalProgressStep } from '@/lib/api/portal-data';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type ApplicationProgressStepperProps = {
  steps: PortalProgressStep[];
};

export function ApplicationProgressStepper({ steps }: ApplicationProgressStepperProps) {
  return (
    <div className="rounded-xl border border-ink-08 bg-white p-6">
      <h2 className="font-heading text-lg font-semibold text-ink">Application Progress</h2>
      <ol className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        {steps.map((step, index) => (
          <li key={step.label} className="flex flex-1 flex-col items-center gap-2 text-center">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full border-2',
                step.status === 'completed' && 'border-brand-teal-700 bg-brand-teal-700 text-white',
                step.status === 'in_progress' && 'border-brand-teal-500 bg-white',
                step.status === 'pending' && 'border-ink-20 bg-white',
              )}
            >
              {step.status === 'completed' ? (
                <Check className="h-5 w-5" aria-hidden />
              ) : step.status === 'in_progress' ? (
                <span className="h-2.5 w-2.5 rounded-full bg-brand-teal-500" />
              ) : null}
            </div>
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

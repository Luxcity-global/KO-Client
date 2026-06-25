import Link from 'next/link';
import { ArrowRight, Info } from 'lucide-react';
import type { PortalTask } from '@/lib/api/portal-data';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

type NextStepsCardProps = {
  tasks: PortalTask[];
};

export function NextStepsCard({ tasks }: NextStepsCardProps) {
  return (
    <div className="rounded-xl border border-ink-08 bg-white p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue/10 text-blue">
          <Info className="h-5 w-5" aria-hidden />
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-ink">Your next steps</h2>
          <p className="mt-1 text-sm text-ink-60">
            Complete these to move your application forward.
          </p>
        </div>
      </div>

      <ul className="mt-6 space-y-4">
        {tasks.map((task) => (
          <li key={task.id} className="flex items-start gap-3">
            <Checkbox checked={task.completed} disabled className="mt-0.5" />
            <span
              className={cn('text-sm text-ink', task.completed && 'text-ink-60 line-through')}
            >
              {task.label}
            </span>
          </li>
        ))}
      </ul>

      <Button asChild className="mt-6 w-full">
        <Link href="/application">
          Go to My Application
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </div>
  );
}

import Link from 'next/link';
import { Mail, Phone } from 'lucide-react';
import type { PortalAdviser } from '@/lib/api/portal-data';
import { Button } from '@/components/ui/button';

type AdviserContactCardProps = {
  adviser: PortalAdviser;
};

export function AdviserContactCard({ adviser }: AdviserContactCardProps) {
  const fullName = `${adviser.firstName} ${adviser.lastName}`;

  return (
    <div className="rounded-xl border border-ink-08 bg-white p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber/20 text-lg font-bold text-amber">
          {adviser.initials}
        </div>
        <div>
          <h2 className="font-heading text-lg font-semibold text-ink">{fullName}</h2>
          <p className="text-sm text-ink-60">{adviser.title}</p>
        </div>
      </div>

      <ul className="mt-6 space-y-3 text-sm text-ink">
        <li className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-ink-60" aria-hidden />
          {adviser.phone}
        </li>
        <li className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-ink-60" aria-hidden />
          {adviser.email}
        </li>
      </ul>

      <Button asChild variant="outline" className="mt-6 w-full">
        <Link href="/messages">Send a message</Link>
      </Button>
    </div>
  );
}

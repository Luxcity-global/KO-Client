'use client';

import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type MessagesTab = 'chat' | 'documents';

export function MessagesTabSwitcher({
  active,
  onChange,
}: {
  active: MessagesTab;
  onChange: (tab: MessagesTab) => void;
}) {
  return (
    <div className="inline-flex w-full rounded-full bg-[#f4f4f5] p-1 sm:w-auto">
      {/* Mobile: short labels · Desktop: original full labels */}
      <button
        type="button"
        onClick={() => onChange('chat')}
        className={cn(
          'flex-1 rounded-full px-5 py-2 text-sm font-semibold transition-all sm:flex-none',
          active === 'chat'
            ? 'bg-white text-[#18181b] shadow-sm'
            : 'text-[#71717a] hover:text-[#18181b]',
        )}
      >
        <span className="lg:hidden">Chat</span>
        <span className="hidden lg:inline">Chat with Advisor</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('documents')}
        className={cn(
          'flex-1 rounded-full px-5 py-2 text-sm font-semibold transition-all sm:flex-none',
          active === 'documents'
            ? 'bg-white text-[#18181b] shadow-sm'
            : 'text-[#71717a] hover:text-[#18181b]',
        )}
      >
        <span className="lg:hidden">Documents</span>
        <span className="hidden lg:inline">Required Documents</span>
      </button>
    </div>
  );
}

export function MessagesPageHeader({
  docsCompleted,
  docsTotal,
  className,
  children,
}: {
  docsCompleted?: number;
  docsTotal?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const showBadge =
    typeof docsCompleted === 'number' && typeof docsTotal === 'number' && docsTotal > 0;

  return (
    <header className={cn('shrink-0', className)}>
      {/*
       * Mobile: compact title + full-width border-b (wrapper provides -mx-4)
       * Desktop: original large title + subtitle, no border
       */}
      <div className="border-b border-[#e4e4e7] px-4 pb-3 pt-4 lg:border-b-0 lg:px-0 lg:pt-0 lg:pb-0">
        {/* Mobile title */}
        <h1 className="font-heading text-2xl font-bold text-ink lg:hidden">Messages</h1>

        {/* Desktop title — original style */}
        <h1 className="hidden font-heading text-3xl font-bold text-brand-teal-700 lg:block">
          Messages &amp; Documents
        </h1>
        <p className="mt-2 hidden text-sm text-[#71717a] lg:block">
          Communicate with your advisor and manage required documents
        </p>

        {/* Docs badge — mobile only (desktop has the subtitle instead) */}
        {showBadge && (
          <span className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-brand-teal-500/30 bg-brand-teal-50 px-3 py-1 text-xs font-semibold text-brand-teal-700 lg:hidden">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            {docsCompleted}/{docsTotal} docs uploaded
          </span>
        )}
      </div>

      {/* Tab switcher */}
      {children && <div className="mt-3 px-4 lg:px-0">{children}</div>}
    </header>
  );
}

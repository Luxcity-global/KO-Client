'use client';

import { useState } from 'react';
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
    <div className="inline-flex rounded-full bg-[#f4f4f5] p-1">
      <button
        type="button"
        onClick={() => onChange('chat')}
        className={cn(
          'rounded-full px-5 py-2 text-sm font-semibold transition-all',
          active === 'chat'
            ? 'bg-white text-[#18181b] shadow-sm'
            : 'text-[#71717a] hover:text-[#18181b]',
        )}
      >
        Chat with Advisor
      </button>
      <button
        type="button"
        onClick={() => onChange('documents')}
        className={cn(
          'rounded-full px-5 py-2 text-sm font-semibold transition-all',
          active === 'documents'
            ? 'bg-white text-[#18181b] shadow-sm'
            : 'text-[#71717a] hover:text-[#18181b]',
        )}
      >
        Required Documents
      </button>
    </div>
  );
}

export function MessagesPageHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="space-y-4">
      <div>
        <h1 className="font-heading text-3xl font-bold text-brand-teal-700">Messages & Documents</h1>
        <p className="mt-2 text-sm text-[#71717a]">
          Communicate with your advisor and manage required documents
        </p>
      </div>
      {children}
    </header>
  );
}

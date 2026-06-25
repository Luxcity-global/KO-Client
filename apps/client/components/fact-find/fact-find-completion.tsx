'use client';

import Link from 'next/link';
import { Check } from 'lucide-react';

export function FactFindCompletion({
  caseReference,
  sectionsCompleted,
}: {
  caseReference: string;
  sectionsCompleted: number;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-teal-50">
          <Check className="h-10 w-10 text-brand-teal-700" strokeWidth={2.5} />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#18181b]">Fact-find complete</h2>
        <p className="mt-2 text-sm text-[#71717a]">
          Thank you — your adviser will review your answers and be in touch if anything else is
          needed.
        </p>
        <div className="mt-6 rounded-xl border border-[#e4e4e7] bg-[#f4f4f5] p-4 text-left text-sm">
          <div className="flex justify-between border-b border-[#e4e4e7] py-2">
            <span className="text-[#71717a]">Case reference</span>
            <span className="font-mono font-semibold">{caseReference}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-[#71717a]">Sections completed</span>
            <span className="font-semibold text-brand-teal-700">{sectionsCompleted}</span>
          </div>
        </div>
        <Link
          href="/overview"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-teal-700 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-teal-500"
        >
          Return to overview
        </Link>
      </div>
    </div>
  );
}

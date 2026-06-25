'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CalculatorSidebar, type CalculatorId } from '@/components/calculators/calculator-sidebar';
import {
  CALCULATOR_CATALOG,
  MortgageCalculatorPanel,
} from '@/components/calculators/mortgage-calculators';
import { useCalculatorPrefill } from '@/hooks/use-calculator-prefill';

export function MortgageToolsPage() {
  const [activeCalculator, setActiveCalculator] = useState<CalculatorId>('affordability');
  const prefill = useCalculatorPrefill();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <header>
        <h1 className="font-heading text-2xl font-bold text-ink">Mortgage Tools</h1>
        <p className="mt-1 text-sm text-[#71717a]">
          Explore estimates to help you plan your mortgage.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-12 lg:gap-8">
        <aside className="lg:col-span-3">
          <CalculatorSidebar
            calculators={CALCULATOR_CATALOG}
            activeId={activeCalculator}
            onSelect={setActiveCalculator}
          />
        </aside>

        <main className="min-w-0 space-y-6 lg:col-span-9">
          <MortgageCalculatorPanel activeCalculator={activeCalculator} prefill={prefill} />

          <div className="rounded-lg border border-ink-08 bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Note:</strong> These calculators provide
              estimates for guidance only. Actual figures may vary based on individual
              circumstances and lender criteria. Always consult with a qualified{' '}
              <Link href="/messages" className="text-brand-teal-700 underline underline-offset-2">
                mortgage adviser
              </Link>{' '}
              for personalized advice.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

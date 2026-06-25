'use client';

import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CalculatorId =
  | 'affordability'
  | 'monthly-payment'
  | 'stamp-duty'
  | 'ltv'
  | 'erc'
  | 'rental-yield'
  | 'remortgage'
  | 'debt-consolidation';

export interface CalculatorCatalogItem {
  id: CalculatorId;
  name: string;
  description: string;
  icon: LucideIcon;
  containerBg: string;
  iconColor: string;
}

interface CalculatorSidebarProps {
  calculators: readonly CalculatorCatalogItem[];
  activeId: CalculatorId;
  onSelect: (id: CalculatorId) => void;
}

export function CalculatorSidebar({ calculators, activeId, onSelect }: CalculatorSidebarProps) {
  return (
    <div className="rounded-lg border border-ink-08 bg-card p-4 lg:sticky lg:top-8">
      <h3 className="mb-3 px-2 text-sm font-semibold text-muted-foreground">CALCULATORS</h3>
      <nav className="space-y-1">
        {calculators.map((calc) => {
          const Icon = calc.icon;
          const isActive = activeId === calc.id;

          return (
            <button
              key={calc.id}
              type="button"
              onClick={() => onSelect(calc.id)}
              className={cn(
                'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-all',
                isActive
                  ? 'bg-white shadow-sm ring-1 ring-ink-20'
                  : 'border border-transparent bg-white hover:bg-gray-50',
              )}
            >
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md"
                style={{ backgroundColor: calc.containerBg }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: calc.iconColor }} aria-hidden />
              </div>
              <span
                className="text-sm font-medium"
                style={{ color: isActive ? calc.iconColor : '#0a0a0a' }}
              >
                {calc.name}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

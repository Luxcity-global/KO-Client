'use client';

import { useEffect, useState } from 'react';
import { ffLoadFromStorage } from '@/lib/fact-find/form-state';
import { usePortalCase } from '@/hooks/use-portal-case';

export interface CalculatorPrefill {
  loanAmount?: number;
  propertyValue?: number;
  termYears?: number;
  annualIncome?: number;
  isBtl?: boolean;
}

function parseAmount(value: string | undefined): number | undefined {
  const parsed = parseFloat((value ?? '').replace(/,/g, ''));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function useCalculatorPrefill(): CalculatorPrefill {
  const { data: caseData } = usePortalCase();
  const [prefill, setPrefill] = useState<CalculatorPrefill>({});

  useEffect(() => {
    if (!caseData) return;

    const form = ffLoadFromStorage(caseData.case.id);

    setPrefill({
      loanAmount: parseAmount(form?.property.mortgageAmount),
      propertyValue: parseAmount(form?.property.propertyValue),
      termYears: parseAmount(form?.property.termYears),
      annualIncome: parseAmount(form?.client1Income.grossSalary),
      isBtl: caseData.case.type === 'BTL',
    });
  }, [caseData]);

  return prefill;
}

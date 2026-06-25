import type { CaseType } from '@ko/types';

export type FactFindSectionId =
  | 'personal'
  | 'employment'
  | 'income'
  | 'commitments'
  | 'property'
  | 'adverseCredit'
  | 'goals'
  | 'vulnerability';

export interface NameDetails {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
}

export interface ClientFactFindForm {
  caseType: CaseType;
  hasJointApplicant: boolean;
  client1Personal: NameDetails & {
    dateOfBirth: string;
    nationality: string;
    phone: string;
    email: string;
    maritalStatus: string;
  };
  client1Employment: {
    status: string;
    employerName: string;
    jobTitle: string;
    startDate: string;
  };
  client1Income: {
    grossSalary: string;
    niNumber: string;
    hasBonus: boolean;
    bonusAmount: string;
  };
  creditCards: { provider: string; balance: string }[];
  loans: { lender: string; balance: string }[];
  property: {
    purchaseType: string;
    propertyValue: string;
    mortgageAmount: string;
    depositSource: string;
    termYears: string;
    repaymentType: string;
    propertyType: string;
  };
  adverseCredit: {
    missedPayments: boolean;
    missedPaymentsDetail: string;
    ccjOrIva: boolean;
    ccjOrIvaDetail: string;
  };
  preferences: {
    goals: string;
    futureChanges: string;
    mattersMost: string;
    ratePreference: string;
    maxMonthlyPayment: string;
    riskAppetite: string;
  };
  vulnerabilityScores: { domain: string; q1: number; q2: number }[];
}

export function ffInitForm(prefill?: {
  firstName?: string;
  lastName?: string;
  email?: string;
}): ClientFactFindForm {
  return {
    caseType: 'PURCHASE',
    hasJointApplicant: false,
    client1Personal: {
      title: '',
      firstName: prefill?.firstName ?? '',
      middleName: '',
      lastName: prefill?.lastName ?? '',
      dateOfBirth: '',
      nationality: 'British',
      phone: '',
      email: prefill?.email ?? '',
      maritalStatus: '',
    },
    client1Employment: {
      status: '',
      employerName: '',
      jobTitle: '',
      startDate: '',
    },
    client1Income: {
      grossSalary: '',
      niNumber: '',
      hasBonus: false,
      bonusAmount: '',
    },
    creditCards: [],
    loans: [],
    property: {
      purchaseType: 'purchase',
      propertyValue: '',
      mortgageAmount: '',
      depositSource: '',
      termYears: '25',
      repaymentType: '',
      propertyType: '',
    },
    adverseCredit: {
      missedPayments: false,
      missedPaymentsDetail: '',
      ccjOrIva: false,
      ccjOrIvaDetail: '',
    },
    preferences: {
      goals: '',
      futureChanges: '',
      mattersMost: '',
      ratePreference: '',
      maxMonthlyPayment: '',
      riskAppetite: '',
    },
    vulnerabilityScores: [
      { domain: 'Health', q1: -1, q2: -1 },
      { domain: 'Life events', q1: -1, q2: -1 },
      { domain: 'Resilience', q1: -1, q2: -1 },
      { domain: 'Capability', q1: -1, q2: -1 },
      { domain: 'External', q1: -1, q2: -1 },
      { domain: 'Other', q1: -1, q2: -1 },
    ],
  };
}

export function ffGetStorageKey(caseId: string) {
  return `ko-portal-factfind-${caseId}`;
}

export function ffLoadFromStorage(caseId: string): ClientFactFindForm | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(ffGetStorageKey(caseId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as ClientFactFindForm;
  } catch {
    return null;
  }
}

export function ffSaveToStorage(caseId: string, form: ClientFactFindForm) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(ffGetStorageKey(caseId), JSON.stringify(form));
}

import type { UpsertFactFindInput } from '@ko/types';
import type { ClientFactFindForm } from '@/lib/fact-find/form-state';

export function serializeFactFind(form: ClientFactFindForm): UpsertFactFindInput {
  return {
    personalDetails: {
      client1: form.client1Personal,
      hasJointApplicant: form.hasJointApplicant,
      adverseCredit: form.adverseCredit,
    },
    employmentDetails: {
      client1: form.client1Employment,
    },
    incomeDetails: {
      client1: form.client1Income,
    },
    expenditureDetails: {
      creditCards: form.creditCards,
      loans: form.loans,
    },
    propertyDetails: {
      ...form.property,
      caseType: form.caseType,
    },
    clientPreferences: {
      ...form.preferences,
      vulnerabilityScores: form.vulnerabilityScores,
    },
  };
}

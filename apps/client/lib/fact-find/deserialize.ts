import type { ClientFactFindForm } from '@/lib/fact-find/form-state';
import { ffInitForm } from '@/lib/fact-find/form-state';

export interface FactFindApiData {
  personalDetails?: Record<string, unknown>;
  employmentDetails?: Record<string, unknown>;
  incomeDetails?: Record<string, unknown>;
  expenditureDetails?: Record<string, unknown>;
  propertyDetails?: Record<string, unknown>;
  existingMortgages?: Record<string, unknown>;
  clientPreferences?: Record<string, unknown>;
  completedAt?: string | null;
}

export function deserializeFactFind(
  data: FactFindApiData,
  prefill?: { firstName?: string; lastName?: string; email?: string },
): ClientFactFindForm {
  const base = ffInitForm(prefill);
  const personal = data.personalDetails as
    | {
        client1?: ClientFactFindForm['client1Personal'];
        hasJointApplicant?: boolean;
        adverseCredit?: ClientFactFindForm['adverseCredit'];
      }
    | undefined;
  const employment = data.employmentDetails as
    | { client1?: ClientFactFindForm['client1Employment'] }
    | undefined;
  const income = data.incomeDetails as
    | { client1?: ClientFactFindForm['client1Income'] }
    | undefined;
  const expenditure = data.expenditureDetails as
    | {
        creditCards?: ClientFactFindForm['creditCards'];
        loans?: ClientFactFindForm['loans'];
      }
    | undefined;
  const property = data.propertyDetails as
    | (ClientFactFindForm['property'] & { caseType?: ClientFactFindForm['caseType'] })
    | undefined;
  const preferences = data.clientPreferences as
    | (ClientFactFindForm['preferences'] & {
        vulnerabilityScores?: ClientFactFindForm['vulnerabilityScores'];
      })
    | undefined;

  return {
    ...base,
    caseType: property?.caseType ?? base.caseType,
    hasJointApplicant: personal?.hasJointApplicant ?? base.hasJointApplicant,
    client1Personal: personal?.client1
      ? { ...base.client1Personal, ...personal.client1 }
      : base.client1Personal,
    client1Employment: employment?.client1
      ? { ...base.client1Employment, ...employment.client1 }
      : base.client1Employment,
    client1Income: income?.client1
      ? { ...base.client1Income, ...income.client1 }
      : base.client1Income,
    creditCards: expenditure?.creditCards ?? base.creditCards,
    loans: expenditure?.loans ?? base.loans,
    property: property
      ? {
          purchaseType: property.purchaseType ?? base.property.purchaseType,
          propertyValue: property.propertyValue ?? base.property.propertyValue,
          mortgageAmount: property.mortgageAmount ?? base.property.mortgageAmount,
          depositSource: property.depositSource ?? base.property.depositSource,
          termYears: property.termYears ?? base.property.termYears,
          repaymentType: property.repaymentType ?? base.property.repaymentType,
          propertyType: property.propertyType ?? base.property.propertyType,
        }
      : base.property,
    adverseCredit: personal?.adverseCredit
      ? { ...base.adverseCredit, ...personal.adverseCredit }
      : base.adverseCredit,
    preferences: preferences
      ? {
          goals: preferences.goals ?? base.preferences.goals,
          futureChanges: preferences.futureChanges ?? base.preferences.futureChanges,
          mattersMost: preferences.mattersMost ?? base.preferences.mattersMost,
          ratePreference: preferences.ratePreference ?? base.preferences.ratePreference,
          maxMonthlyPayment: preferences.maxMonthlyPayment ?? base.preferences.maxMonthlyPayment,
          riskAppetite: preferences.riskAppetite ?? base.preferences.riskAppetite,
        }
      : base.preferences,
    vulnerabilityScores: preferences?.vulnerabilityScores ?? base.vulnerabilityScores,
  };
}

import type { ClientFactFindForm } from '@/lib/fact-find/form-state';
import type { FactFindQuestion } from '@/components/fact-find/questions/question-registry';
import { SECTION_GROUPS } from '@/components/fact-find/questions/question-registry';

export interface MissingField {
  questionIndex: number;
  sectionLabel: string;
  fieldLabel: string;
  reason: string;
}

const FIELD_LABELS: Record<string, string> = {
  'c1-name': 'Your name',
  'c1-dob': 'Date of birth',
  'c1-contact': 'Contact details',
  'c1-emp': 'Employment status',
  'c1-salary': 'Gross annual salary',
  'prop-values': 'Property & mortgage amount',
  'goals-main': 'Your goals',
  'vulnerability': 'Vulnerability assessment',
};

const FIELD_REASONS: Record<string, string> = {
  'c1-name': 'Required for account setup',
  'c1-dob': 'Required for identity verification',
  'c1-contact': 'Required so your adviser can reach you',
  'c1-emp': 'Required for income assessment',
  'c1-salary': 'Required for affordability calculation',
  'prop-values': 'Required to process your application',
  'goals-main': 'Helps your adviser understand your needs',
  'vulnerability': 'Required for regulatory compliance',
};

export function collectMissingFields(
  visibleQuestions: FactFindQuestion[],
  form: ClientFactFindForm,
): MissingField[] {
  const missing: MissingField[] = [];

  visibleQuestions.forEach((question, idx) => {
    const validationError = validateQuestion(question, form);
    if (!validationError) return;

    const sectionGroup = SECTION_GROUPS.find((s) => s.id === question.section);
    missing.push({
      questionIndex: idx,
      sectionLabel: sectionGroup?.label ?? question.section,
      fieldLabel: FIELD_LABELS[question.id] ?? question.title,
      reason: FIELD_REASONS[question.id] ?? validationError,
    });
  });

  return missing;
}

export function validateQuestion(
  question: FactFindQuestion,
  form: ClientFactFindForm,
): string | null {
  switch (question.id) {
    case 'c1-name':
      if (!form.client1Personal.firstName.trim()) return 'First name is required';
      if (!form.client1Personal.lastName.trim()) return 'Last name is required';
      return null;
    case 'c1-dob':
      if (!form.client1Personal.dateOfBirth.trim()) return 'Date of birth is required';
      return null;
    case 'c1-contact':
      if (!form.client1Personal.phone.trim()) return 'Phone number is required';
      return null;
    case 'c1-emp':
      if (!form.client1Employment.status) return 'Please select your employment status';
      return null;
    case 'c1-salary':
      if (!form.client1Income.grossSalary.trim()) return 'Gross annual salary is required';
      return null;
    case 'prop-values':
      if (!form.property.propertyValue.trim()) return 'Property value is required';
      if (!form.property.mortgageAmount.trim()) return 'Mortgage amount is required';
      return null;
    case 'goals-main':
      if (!form.preferences.goals.trim()) return 'Please tell us what you hope to achieve';
      return null;
    case 'vulnerability':
      if (form.vulnerabilityScores.some((d) => d.q1 < 0 || d.q2 < 0)) {
        return 'Please answer all vulnerability questions';
      }
      return null;
    default:
      return null;
  }
}

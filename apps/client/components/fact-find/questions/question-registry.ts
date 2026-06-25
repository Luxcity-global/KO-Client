import type { FactFindSectionId } from '@/lib/fact-find/form-state';
import type { ClientFactFindForm } from '@/lib/fact-find/form-state';

export type QuestionFieldType =
  | 'name-group'
  | 'text'
  | 'contact-group'
  | 'pills'
  | 'employer-group'
  | 'currency'
  | 'yesno-detail'
  | 'property-value-group'
  | 'textarea'
  | 'rate-prefs'
  | 'vulnerability';

export interface FactFindQuestion {
  id: string;
  section: FactFindSectionId;
  title: string;
  subtitle?: string;
  fieldType: QuestionFieldType;
  showIf?: (form: ClientFactFindForm) => boolean;
  pillOptions?: { value: string; label: string }[];
}

export const SECTION_GROUPS: {
  id: FactFindSectionId;
  label: string;
  stripLabel: string;
}[] = [
  { id: 'personal', label: 'Personal', stripLabel: 'Personal' },
  { id: 'employment', label: 'Employment', stripLabel: 'Employment' },
  { id: 'income', label: 'Income', stripLabel: 'Income' },
  { id: 'commitments', label: 'Commitments', stripLabel: 'Commitments' },
  { id: 'property', label: 'Property', stripLabel: 'Property' },
  { id: 'adverseCredit', label: 'Adverse Credit', stripLabel: 'Adverse Credit' },
  { id: 'goals', label: 'Goals', stripLabel: 'Goals' },
  { id: 'vulnerability', label: 'Vulnerability', stripLabel: 'Vulnerability' },
];

export const EMPLOYMENT_OPTIONS = [
  { value: 'employed', label: 'Employed' },
  { value: 'self-employed', label: 'Self-employed' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'retired', label: 'Retired' },
  { value: 'unemployed', label: 'Unemployed' },
];

export const MARITAL_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'civil-partnership', label: 'Civil partnership' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
];

export const RATE_OPTIONS = [
  { value: 'fixed', label: 'Fixed rate' },
  { value: 'tracker', label: 'Tracker' },
  { value: 'discount', label: 'Discount' },
  { value: 'unsure', label: 'Not sure yet' },
];

export const RISK_OPTIONS = [
  { value: 'low', label: 'Low risk' },
  { value: 'medium', label: 'Balanced' },
  { value: 'high', label: 'Higher risk' },
];

export const FF_QUESTIONS: FactFindQuestion[] = [
  {
    id: 'c1-name',
    section: 'personal',
    title: 'What is your full name?',
    subtitle: 'Include legal name as it appears on your ID',
    fieldType: 'name-group',
  },
  {
    id: 'c1-dob',
    section: 'personal',
    title: 'What is your date of birth?',
    fieldType: 'text',
  },
  {
    id: 'c1-marital',
    section: 'personal',
    title: 'What is your marital status?',
    fieldType: 'pills',
    pillOptions: MARITAL_OPTIONS,
  },
  {
    id: 'c1-contact',
    section: 'personal',
    title: 'How can we contact you?',
    subtitle: 'Your adviser may need to reach you about your application',
    fieldType: 'contact-group',
  },
  {
    id: 'c1-emp',
    section: 'employment',
    title: 'What is your employment status?',
    fieldType: 'pills',
    pillOptions: EMPLOYMENT_OPTIONS,
  },
  {
    id: 'c1-employer',
    section: 'employment',
    title: 'Who is your current employer?',
    fieldType: 'employer-group',
    showIf: (f) => ['employed', 'contractor'].includes(f.client1Employment.status),
  },
  {
    id: 'c1-salary',
    section: 'income',
    title: 'What is your gross annual salary?',
    fieldType: 'currency',
  },
  {
    id: 'c1-ni',
    section: 'income',
    title: 'What is your National Insurance number?',
    subtitle: 'Optional — helps verify your income',
    fieldType: 'text',
  },
  {
    id: 'fin-cards',
    section: 'commitments',
    title: 'Do you have any credit cards?',
    subtitle: 'List any cards with an outstanding balance',
    fieldType: 'yesno-detail',
  },
  {
    id: 'prop-values',
    section: 'property',
    title: 'What is the property value and mortgage amount?',
    fieldType: 'property-value-group',
  },
  {
    id: 'prop-type',
    section: 'property',
    title: 'What type of property is it?',
    fieldType: 'pills',
    pillOptions: [
      { value: 'house', label: 'House' },
      { value: 'flat', label: 'Flat' },
      { value: 'bungalow', label: 'Bungalow' },
      { value: 'new-build', label: 'New build' },
    ],
  },
  {
    id: 'ac-c1-missed',
    section: 'adverseCredit',
    title: 'Have you missed any payments in the last 6 years?',
    fieldType: 'yesno-detail',
  },
  {
    id: 'ac-c1-ccj',
    section: 'adverseCredit',
    title: 'Have you had any CCJs, IVAs or bankruptcy?',
    fieldType: 'yesno-detail',
  },
  {
    id: 'goals-main',
    section: 'goals',
    title: 'What are you hoping to achieve?',
    fieldType: 'textarea',
  },
  {
    id: 'rate-prefs',
    section: 'goals',
    title: 'What type of mortgage rate do you prefer?',
    fieldType: 'rate-prefs',
    pillOptions: RATE_OPTIONS,
  },
  {
    id: 'vulnerability',
    section: 'vulnerability',
    title: 'Vulnerability assessment',
    subtitle: 'These questions help us provide appropriate support if needed',
    fieldType: 'vulnerability',
  },
];

export function getVisibleQuestions(form: ClientFactFindForm): FactFindQuestion[] {
  return FF_QUESTIONS.filter((q) => !q.showIf || q.showIf(form));
}

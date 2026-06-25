import type { CaseStage } from '@ko/types';

export type ProgressStepStatus = 'completed' | 'in_progress' | 'pending';

export interface PortalClient {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PortalAdviser {
  firstName: string;
  lastName: string;
  initials: string;
  phone: string;
  email: string;
  title: string;
}

export interface PortalCase {
  id: string;
  referenceNumber: string;
  stage: CaseStage;
  clientStageLabel: string;
  type: string;
}

export interface PortalTask {
  id: string;
  label: string;
  completed: boolean;
}

export interface PortalProgressStep {
  label: string;
  status: ProgressStepStatus;
}

export interface PortalDocumentTask {
  id: string;
  title: string;
  description: string;
  required: boolean;
  fileName?: string;
  completed: boolean;
}

export interface PortalMessage {
  id: string;
  direction: 'INBOUND' | 'OUTBOUND' | 'SYSTEM';
  body: string;
  createdAt: string;
}

export interface PortalSession {
  client: PortalClient;
  adviser: PortalAdviser;
  case: PortalCase;
  tasks: PortalTask[];
  progressSteps: PortalProgressStep[];
}

export interface InviteValidation {
  client: PortalClient;
  adviser: PortalAdviser;
  case: Pick<PortalCase, 'referenceNumber' | 'id'>;
}

export const MOCK_PORTAL_SESSION: PortalSession = {
  client: {
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.johnson@example.com',
  },
  adviser: {
    firstName: 'James',
    lastName: 'Davies',
    initials: 'JD',
    phone: '+44 7700 900 000',
    email: 'james@kodavis.co.uk',
    title: 'Your Mortgage Advisor',
  },
  case: {
    id: 'case-mock-1',
    referenceNumber: 'KOF-2025-0042',
    stage: 'DIP',
    clientStageLabel: 'KIP Submitted',
    type: 'PURCHASE',
  },
  tasks: [
    { id: '1', label: "Upload your last 3 months' payslips", completed: false },
    { id: '2', label: 'Upload a bank statement from the past 3 months', completed: true },
    { id: '3', label: 'Confirm your employment start date', completed: true },
  ],
  progressSteps: [
    { label: 'Information Gathering', status: 'completed' },
    { label: 'Broker Review', status: 'completed' },
    { label: 'KIP Submitted', status: 'in_progress' },
    { label: 'Mortgage Offer', status: 'pending' },
  ],
};

export const MOCK_MESSAGES: PortalMessage[] = [
  {
    id: 'msg-1',
    direction: 'OUTBOUND',
    body: "Hi Sarah, thanks for getting started on your application. When you have a moment, could you upload your last 3 months' payslips and bank statements?",
    createdAt: '2025-06-10T10:24:00.000Z',
  },
  {
    id: 'msg-2',
    direction: 'OUTBOUND',
    body: "We'll also need your most recent P60 when you get a chance. You can upload everything under Required Documents.",
    createdAt: '2025-06-10T10:25:00.000Z',
  },
  {
    id: 'msg-3',
    direction: 'INBOUND',
    body: "Thanks James — I'll upload my payslips and bank statements this evening.",
    createdAt: '2025-06-10T14:30:00.000Z',
  },
];

export const MOCK_DOCUMENTS: PortalDocumentTask[] = [
  {
    id: 'doc-1',
    title: "3 months' payslips",
    description: 'Your most recent 3 payslips',
    required: true,
    completed: false,
  },
  {
    id: 'doc-2',
    title: 'Bank statements (3 months)',
    description: 'All accounts, showing full transactions',
    required: true,
    completed: false,
  },
  {
    id: 'doc-3',
    title: 'Photo ID',
    description: 'Passport or driving licence',
    required: true,
    completed: true,
    fileName: 'passport.jpg',
  },
  {
    id: 'doc-4',
    title: 'Proof of address',
    description: 'Utility bill or council tax (within 3 months)',
    required: true,
    completed: true,
    fileName: 'utility_bill.pdf',
  },
  {
    id: 'doc-5',
    title: 'P60 (last tax year)',
    description: 'Most recent P60 from your employer',
    required: true,
    completed: false,
  },
  {
    id: 'doc-6',
    title: 'Property survey',
    description: 'If already commissioned',
    required: false,
    completed: false,
  },
];

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

export async function fetchPortalDocuments(_token?: string): Promise<PortalDocumentTask[]> {
  if (USE_MOCK) {
    await delay();
    return MOCK_DOCUMENTS.map((d) => ({ ...d }));
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<PortalDocumentTask[]>('/api/portal/documents', { token: _token });
  return unwrapPortalResponse(res);
}

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function validateInviteToken(_token: string): Promise<InviteValidation> {
  if (USE_MOCK) {
    await delay();
    return {
      client: MOCK_PORTAL_SESSION.client,
      adviser: MOCK_PORTAL_SESSION.adviser,
      case: {
        id: MOCK_PORTAL_SESSION.case.id,
        referenceNumber: MOCK_PORTAL_SESSION.case.referenceNumber,
      },
    };
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<InviteValidation>('/api/portal/invite/validate', {
    method: 'POST',
    portalToken: _token,
  });
  return unwrapPortalResponse(res);
}

export async function sendInviteOtp(_token: string): Promise<{ sent: boolean }> {
  if (USE_MOCK) {
    await delay();
    return { sent: true };
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<{ sent: boolean }>('/api/portal/invite/send-otp', {
    method: 'POST',
    portalToken: _token,
  });
  return unwrapPortalResponse(res);
}

export async function verifyInviteOtp(_token: string, _code: string): Promise<{ verified: boolean }> {
  if (USE_MOCK) {
    await delay();
    if (_code.length < 6) {
      throw new Error('Invalid verification code');
    }
    return { verified: true };
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<{ verified: boolean }>('/api/portal/invite/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ code: _code }),
    portalToken: _token,
  });
  return unwrapPortalResponse(res);
}

export async function fetchPortalSession(_token?: string): Promise<PortalSession> {
  if (USE_MOCK) {
    await delay();
    return MOCK_PORTAL_SESSION;
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<PortalSession>('/api/portal/me', { token: _token });
  return unwrapPortalResponse(res);
}

export async function fetchPortalCase(_token?: string): Promise<PortalSession> {
  if (USE_MOCK) {
    await delay();
    return MOCK_PORTAL_SESSION;
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<PortalSession>('/api/portal/cases', { token: _token });
  return unwrapPortalResponse(res);
}

export async function fetchPortalTasks(_token?: string): Promise<PortalTask[]> {
  if (USE_MOCK) {
    await delay();
    return MOCK_PORTAL_SESSION.tasks;
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<PortalTask[]>(
    `/api/portal/cases/${MOCK_PORTAL_SESSION.case.id}/tasks`,
    { token: _token },
  );
  return unwrapPortalResponse(res);
}

export async function fetchPortalMessages(_token?: string): Promise<PortalMessage[]> {
  if (USE_MOCK) {
    await delay();
    return MOCK_MESSAGES;
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<PortalMessage[]>('/api/portal/messages', { token: _token });
  return unwrapPortalResponse(res);
}

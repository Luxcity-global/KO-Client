import type { CaseStage } from '@ko/types';
import { loadInviteContext, storeInviteContext } from '@/lib/api/invite-context';
import { useMockForInvite, useMockPortalData } from '@/lib/api/invite-mode';

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

export interface TokenVerification {
  client: PortalClient & { id?: string };
  case: Pick<PortalCase, 'referenceNumber' | 'id' | 'type' | 'stage'> | null;
  adviser: Pick<PortalAdviser, 'firstName' | 'lastName' | 'email' | 'phone'>;
}

export interface PortalLoginResult {
  id: string;
  email: string;
}

export interface FactFindUpdateResult {
  id: string;
  completedAt: string | null;
}

export interface FactFindCompleteResult {
  completedAt: string;
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
    { id: '2', label: 'Upload a bank statement from the past 3 months', completed: false },
    { id: '3', label: 'Confirm your employment start date', completed: true },
    { id: '4', label: 'Sign and return the data consent form', completed: true },
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
    body: "Hi Alexandra! I've reviewed your initial details. Everything looks good so far. I'll need your payslips and bank statements to move forward.",
    createdAt: '2025-06-09T10:24:00.000Z',
  },
  {
    id: 'msg-2',
    direction: 'INBOUND',
    body: "Hi James, thank you! I'll get those uploaded today.",
    createdAt: '2025-06-09T10:35:00.000Z',
  },
  {
    id: 'msg-3',
    direction: 'OUTBOUND',
    body: 'Great. Once those are in I can submit to the lender. Also please upload your P60.',
    createdAt: '2025-06-09T10:45:00.000Z',
  },
  {
    id: 'msg-4',
    direction: 'INBOUND',
    body: 'Got it. Will have everything uploaded by this evening.',
    createdAt: '2025-06-09T11:00:00.000Z',
  },
  {
    id: 'msg-5',
    direction: 'OUTBOUND',
    body: "Perfect, no rush. I'll be in touch with the lender submission timeline once I have everything.",
    createdAt: '2025-06-09T11:10:00.000Z',
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


const CLIENT_PROFILE_KEY = 'ko-portal-client-profile';

export function storeClientProfile(client: PortalClient & { id?: string }) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(CLIENT_PROFILE_KEY, JSON.stringify(client));
}

export function loadClientProfile(): (PortalClient & { id?: string }) | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(CLIENT_PROFILE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PortalClient & { id?: string };
  } catch {
    return null;
  }
}

export function clearClientProfile() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CLIENT_PROFILE_KEY);
}

function buildFallbackSession(profile: PortalClient & { id?: string }): PortalSession {
  return {
    client: profile,
    adviser: {
      firstName: 'Your',
      lastName: 'Adviser',
      initials: 'YA',
      phone: '',
      email: '',
      title: 'Your Mortgage Advisor',
    },
    case: {
      id: 'portal',
      referenceNumber: 'Your application',
      stage: 'FACT_FIND',
      clientStageLabel: 'In progress',
      type: 'PURCHASE',
    },
    tasks: [],
    progressSteps: [
      { label: 'Information Gathering', status: 'in_progress' },
      { label: 'Broker Review', status: 'pending' },
      { label: 'KIP Submitted', status: 'pending' },
      { label: 'Mortgage Offer', status: 'pending' },
    ],
  };
}

function buildSessionFromInvite(invite: InviteValidation): PortalSession {
  return {
    client: invite.client,
    adviser: invite.adviser,
    case: {
      id: invite.case.id,
      referenceNumber: invite.case.referenceNumber,
      stage: 'FACT_FIND',
      clientStageLabel: 'In progress',
      type: 'PURCHASE',
    },
    tasks: [],
    progressSteps: [
      { label: 'Information Gathering', status: 'in_progress' },
      { label: 'Broker Review', status: 'pending' },
      { label: 'KIP Submitted', status: 'pending' },
      { label: 'Mortgage Offer', status: 'pending' },
    ],
  };
}

function normalizePortalMessage(
  message: Partial<PortalMessage> & Pick<PortalMessage, 'direction' | 'body'>,
  index = 0,
): PortalMessage {
  return {
    id: message.id ?? `msg-${index}-${Date.now()}`,
    direction: message.direction,
    body: message.body,
    createdAt: message.createdAt ?? new Date().toISOString(),
  };
}

function normalizePortalMessages(
  messages: Array<Partial<PortalMessage> & Pick<PortalMessage, 'direction' | 'body'>>,
) {
  return messages.map((message, index) => normalizePortalMessage(message, index));
}

export async function fetchPortalDocuments(_token?: string): Promise<PortalDocumentTask[]> {
  if (useMockPortalData()) {
    await delay();
    return MOCK_DOCUMENTS.map((d) => ({ ...d }));
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<PortalDocumentTask[]>('/api/portal/documents', {
    token: _token,
  });
  return unwrapPortalResponse(res);
}

function delay(ms = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function validateInviteToken(token: string): Promise<InviteValidation> {
  if (useMockForInvite(token)) {
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

  const verification = await verifyPortalToken(token);
  const invite: InviteValidation = {
    client: verification.client,
    adviser: {
      firstName: verification.adviser.firstName,
      lastName: verification.adviser.lastName,
      initials: `${verification.adviser.firstName[0] ?? ''}${verification.adviser.lastName[0] ?? ''}`.toUpperCase(),
      phone: verification.adviser.phone ?? '',
      email: verification.adviser.email,
      title: 'Your Mortgage Advisor',
    },
    case: {
      id: verification.case?.id ?? '',
      referenceNumber: verification.case?.referenceNumber ?? '',
    },
  };
  storeInviteContext(invite);
  storeClientProfile({
    ...verification.client,
    id: verification.client.id,
  });
  return invite;
}

export async function verifyPortalToken(token: string): Promise<TokenVerification> {
  if (useMockForInvite(token)) {
    await delay();
    return {
      client: MOCK_PORTAL_SESSION.client,
      case: {
        id: MOCK_PORTAL_SESSION.case.id,
        referenceNumber: MOCK_PORTAL_SESSION.case.referenceNumber,
        type: MOCK_PORTAL_SESSION.case.type,
        stage: MOCK_PORTAL_SESSION.case.stage,
      },
      adviser: {
        firstName: MOCK_PORTAL_SESSION.adviser.firstName,
        lastName: MOCK_PORTAL_SESSION.adviser.lastName,
        email: MOCK_PORTAL_SESSION.adviser.email,
        phone: MOCK_PORTAL_SESSION.adviser.phone,
      },
    };
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<TokenVerification>('/api/portal/verify-token', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
  return unwrapPortalResponse(res);
}

export async function setupPortalAccount(
  token: string,
  password: string,
): Promise<{ success: boolean; clientId: string }> {
  if (useMockForInvite(token)) {
    await delay();
    return { success: true, clientId: 'mock-client' };
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<{ success: boolean; clientId: string; sessionToken?: string }>(
    '/api/portal/setup',
    {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    },
  );
  return unwrapPortalResponse(res);
}

export async function loginPortal(email: string, password: string): Promise<PortalLoginResult> {
  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<{ success: boolean; clientId: string }>('/api/portal/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  const data = unwrapPortalResponse(res);
  const result = { id: data.clientId, email };
  storeClientProfile({
    email,
    firstName: email.split('@')[0] ?? 'Client',
    lastName: '',
    id: data.clientId,
  });
  return result;
}

export async function logoutPortal(): Promise<void> {
  if (useMockPortalData()) {
    await delay();
    return;
  }

  const { portalFetch } = await import('@/lib/api/client');
  await portalFetch('/api/portal/logout', {
    method: 'POST',
  });
  clearClientProfile();
}

export async function sendInviteOtp(token: string): Promise<{ sent: boolean }> {
  if (useMockForInvite(token)) {
    await delay();
    return { sent: true };
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<{ sent: boolean }>('/api/portal/invite/send-otp', {
    method: 'POST',
    portalToken: token,
  });
  return unwrapPortalResponse(res);
}

export async function verifyInviteOtp(token: string, code: string): Promise<{ verified: boolean }> {
  if (useMockForInvite(token)) {
    await delay();
    if (code.length < 6) {
      throw new Error('Invalid verification code');
    }
    return { verified: true };
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<{ verified: boolean }>('/api/portal/invite/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ code }),
    portalToken: token,
  });
  return unwrapPortalResponse(res);
}

export async function fetchPortalSession(_token?: string): Promise<PortalSession> {
  if (useMockPortalData()) {
    await delay();
    const invite = loadInviteContext();
    if (invite) {
      return buildSessionFromInvite(invite);
    }
    return MOCK_PORTAL_SESSION;
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  try {
    const res = await portalFetch<PortalSession>('/api/portal/me', {
      token: _token,
    });
    const session = unwrapPortalResponse(res);
    storeClientProfile(session.client);
    return session;
  } catch {
    const profile = loadClientProfile();
    if (profile) {
      return buildFallbackSession(profile);
    }
    throw new Error('Session expired. Please sign in again.');
  }
}

export async function fetchPortalCase(_token?: string): Promise<PortalSession> {
  if (useMockPortalData()) {
    await delay();
    const invite = loadInviteContext();
    if (invite) {
      return buildSessionFromInvite(invite);
    }
    return MOCK_PORTAL_SESSION;
  }

  return fetchPortalSession(_token);
}

export async function fetchPortalTasks(_token?: string): Promise<PortalTask[]> {
  if (useMockPortalData()) {
    await delay();
    return MOCK_PORTAL_SESSION.tasks;
  }

  try {
    const session = await fetchPortalSession(_token);
    return session.tasks;
  } catch {
    return [];
  }
}

export async function fetchPortalMessages(_token?: string): Promise<PortalMessage[]> {
  if (useMockPortalData()) {
    await delay();
    return MOCK_MESSAGES;
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<
    Array<Partial<PortalMessage> & Pick<PortalMessage, 'direction' | 'body'>>
  >('/api/portal/messages', {
    token: _token,
  });
  return normalizePortalMessages(unwrapPortalResponse(res));
}

export async function sendPortalMessage(body: string, _token?: string): Promise<PortalMessage> {
  if (useMockPortalData()) {
    await delay();
    return {
      id: `msg-${Date.now()}`,
      direction: 'INBOUND',
      body,
      createdAt: new Date().toISOString(),
    };
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<Partial<PortalMessage> & Pick<PortalMessage, 'direction' | 'body'>>(
    '/api/portal/messages',
    {
      method: 'POST',
      body: JSON.stringify({ body }),
      token: _token,
    },
  );
  return normalizePortalMessage(unwrapPortalResponse(res));
}

export async function fetchFactFind(_token?: string) {
  if (useMockPortalData()) {
    await delay();
    return {
      personalDetails: {},
      employmentDetails: {},
      completedAt: null as string | null,
    };
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<{
    personalDetails?: Record<string, unknown>;
    employmentDetails?: Record<string, unknown>;
    incomeDetails?: Record<string, unknown>;
    expenditureDetails?: Record<string, unknown>;
    propertyDetails?: Record<string, unknown>;
    existingMortgages?: Record<string, unknown>;
    clientPreferences?: Record<string, unknown>;
    completedAt: string | null;
  }>('/api/portal/fact-find', {
    token: _token,
  });
  return unwrapPortalResponse(res);
}

export async function updateFactFind(
  payload: Record<string, unknown>,
  _token?: string,
): Promise<FactFindUpdateResult> {
  if (useMockPortalData()) {
    await delay();
    return { id: 'ff-mock', completedAt: null };
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<FactFindUpdateResult>('/api/portal/fact-find', {
    method: 'PUT',
    body: JSON.stringify(payload),
    token: _token,
  });
  return unwrapPortalResponse(res);
}

export async function completeFactFind(_token?: string): Promise<FactFindCompleteResult> {
  if (useMockPortalData()) {
    await delay();
    return { completedAt: new Date().toISOString() };
  }

  const { portalFetch, unwrapPortalResponse } = await import('@/lib/api/client');
  const res = await portalFetch<FactFindCompleteResult>('/api/portal/fact-find/complete', {
    method: 'POST',
    token: _token,
  });
  return unwrapPortalResponse(res);
}

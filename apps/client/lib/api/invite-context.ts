import type { InviteValidation } from '@/lib/api/portal-data';

const INVITE_CONTEXT_KEY = 'ko-portal-invite-context';
const CONFIGURED_ACCOUNTS_KEY = 'ko-portal-configured-accounts';

export function storeInviteContext(invite: InviteValidation) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(INVITE_CONTEXT_KEY, JSON.stringify(invite));
}

export function loadInviteContext(): InviteValidation | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(INVITE_CONTEXT_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as InviteValidation;
  } catch {
    return null;
  }
}

export function clearInviteContext() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(INVITE_CONTEXT_KEY);
}

function loadConfiguredAccounts(): string[] {
  if (typeof window === 'undefined') return [];
  const raw = sessionStorage.getItem(CONFIGURED_ACCOUNTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return [];
  }
}

export function markAccountConfigured(email: string) {
  if (typeof window === 'undefined' || !email) return;
  const normalized = email.trim().toLowerCase();
  const accounts = loadConfiguredAccounts();
  if (!accounts.includes(normalized)) {
    sessionStorage.setItem(CONFIGURED_ACCOUNTS_KEY, JSON.stringify([...accounts, normalized]));
  }
}

export function isAccountConfiguredLocally(email: string): boolean {
  if (!email) return false;
  return loadConfiguredAccounts().includes(email.trim().toLowerCase());
}

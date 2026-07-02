const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const PORTAL_COOKIE_SESSION_KEY = 'ko-portal-cookie-session';
export const PORTAL_MOCK_SESSION_KEY = 'ko-portal-mock-session';

/** Dev-only placeholder token — not sent by the broker. */
export function isMockInviteToken(token: string): boolean {
  return !token || token === 'mock-invite-token' || !UUID_RE.test(token);
}

/** Use local mocks for invite bootstrap only when no real broker token is present. */
export function useMockForInvite(token: string): boolean {
  return USE_MOCK && isMockInviteToken(token);
}

/** True when the user completed real portal auth (setup/login cookie session). */
export function hasPortalCookieSession(): boolean {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(PORTAL_COOKIE_SESSION_KEY) === '1';
}

/** Use mock API data only for explicit local dev sessions (not real portal login). */
export function useMockPortalData(): boolean {
  if (!USE_MOCK) return false;
  if (hasPortalCookieSession()) return false;
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(PORTAL_MOCK_SESSION_KEY) === '1';
}

export function isLiveApiMode(): boolean {
  return !USE_MOCK;
}

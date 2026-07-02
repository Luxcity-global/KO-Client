'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from 'react';
import { fetchPortalSession } from '@/lib/api/portal-data';
import {
  PORTAL_COOKIE_SESSION_KEY,
  PORTAL_MOCK_SESSION_KEY,
} from '@/lib/api/invite-mode';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

export type PortalAuthValue = {
  isLoaded: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
  signIn: () => void;
  signOut: () => void;
};

const PortalAuthContext = createContext<PortalAuthValue | null>(null);

function subscribeSession(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener('ko-portal-mock-session', onStoreChange);
  window.addEventListener('ko-portal-cookie-session', onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener('ko-portal-mock-session', onStoreChange);
    window.removeEventListener('ko-portal-cookie-session', onStoreChange);
  };
}

function getMockSessionSnapshot() {
  return sessionStorage.getItem(PORTAL_MOCK_SESSION_KEY) === '1';
}

function getCookieSessionSnapshot() {
  return sessionStorage.getItem(PORTAL_COOKIE_SESSION_KEY) === '1';
}

function getSignedInSnapshot() {
  return getMockSessionSnapshot() || getCookieSessionSnapshot();
}

function getServerSessionSnapshot() {
  return false;
}

export function setMockPortalSession() {
  sessionStorage.setItem(PORTAL_MOCK_SESSION_KEY, '1');
  window.dispatchEvent(new Event('ko-portal-mock-session'));
}

export function clearMockPortalSession() {
  sessionStorage.removeItem(PORTAL_MOCK_SESSION_KEY);
  window.dispatchEvent(new Event('ko-portal-mock-session'));
}

export function hasMockPortalSession() {
  if (typeof window === 'undefined') return false;
  return getMockSessionSnapshot();
}

export function setPortalSignedIn() {
  sessionStorage.removeItem(PORTAL_MOCK_SESSION_KEY);
  sessionStorage.setItem(PORTAL_COOKIE_SESSION_KEY, '1');
  window.dispatchEvent(new Event('ko-portal-mock-session'));
  window.dispatchEvent(new Event('ko-portal-cookie-session'));
}

export function clearPortalSignedIn() {
  sessionStorage.removeItem(PORTAL_COOKIE_SESSION_KEY);
  window.dispatchEvent(new Event('ko-portal-cookie-session'));
}

function HybridAuthProvider({ children }: { children: React.ReactNode }) {
  const sessionActive = useSyncExternalStore(
    subscribeSession,
    getSignedInSnapshot,
    getServerSessionSnapshot,
  );
  const cookieActive = useSyncExternalStore(
    subscribeSession,
    getCookieSessionSnapshot,
    getServerSessionSnapshot,
  );
  const mockActive = useSyncExternalStore(
    subscribeSession,
    getMockSessionSnapshot,
    getServerSessionSnapshot,
  );
  const [isLoaded, setIsLoaded] = useState(!cookieActive);
  const [sessionValid, setSessionValid] = useState(mockActive);

  useEffect(() => {
    if (!cookieActive) {
      setSessionValid(mockActive);
      setIsLoaded(true);
      return;
    }

    let cancelled = false;

    async function verifySession() {
      try {
        await fetchPortalSession();
        if (!cancelled) {
          setSessionValid(true);
        }
      } catch {
        if (!cancelled) {
          clearPortalSignedIn();
          setSessionValid(mockActive);
        }
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    }

    void verifySession();
    return () => {
      cancelled = true;
    };
  }, [cookieActive, mockActive]);

  const signIn = useCallback(() => {
    setMockPortalSession();
    setSessionValid(true);
    setIsLoaded(true);
  }, []);

  const signOut = useCallback(() => {
    clearMockPortalSession();
    clearPortalSignedIn();
    setSessionValid(false);
  }, []);

  const value: PortalAuthValue = {
    isLoaded,
    isSignedIn: sessionActive && sessionValid,
    getToken: async () => (mockActive && !cookieActive ? 'mock-token' : null),
    signIn,
    signOut,
  };

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
}

function CookieAuthProvider({ children }: { children: React.ReactNode }) {
  const cookieActive = useSyncExternalStore(
    subscribeSession,
    getCookieSessionSnapshot,
    getServerSessionSnapshot,
  );
  const [isLoaded, setIsLoaded] = useState(false);
  const [sessionValid, setSessionValid] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      if (!cookieActive) {
        if (!cancelled) {
          setSessionValid(false);
          setIsLoaded(true);
        }
        return;
      }

      try {
        await fetchPortalSession();
        if (!cancelled) {
          setSessionValid(true);
        }
      } catch {
        if (!cancelled) {
          clearPortalSignedIn();
          setSessionValid(false);
        }
      } finally {
        if (!cancelled) {
          setIsLoaded(true);
        }
      }
    }

    void verifySession();
    return () => {
      cancelled = true;
    };
  }, [cookieActive]);

  const signIn = useCallback(() => {
    setPortalSignedIn();
    setSessionValid(true);
    setIsLoaded(true);
  }, []);

  const signOut = useCallback(() => {
    clearPortalSignedIn();
    setSessionValid(false);
  }, []);

  const value: PortalAuthValue = {
    isLoaded,
    isSignedIn: cookieActive && sessionValid,
    getToken: async () => null,
    signIn,
    signOut,
  };

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
}

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  if (USE_MOCK) {
    return <HybridAuthProvider>{children}</HybridAuthProvider>;
  }

  return <CookieAuthProvider>{children}</CookieAuthProvider>;
}

export function usePortalAuth() {
  const context = useContext(PortalAuthContext);
  if (!context) {
    throw new Error('usePortalAuth must be used within PortalAuthProvider');
  }
  return context;
}

export function useMockPortalSession() {
  return useSyncExternalStore(
    subscribeSession,
    getMockSessionSnapshot,
    getServerSessionSnapshot,
  );
}

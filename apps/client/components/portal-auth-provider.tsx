'use client';

import { createContext, useContext, useSyncExternalStore } from 'react';
import { ClerkProvider, useAuth as useClerkAuth } from '@clerk/nextjs';

const MOCK_SESSION_KEY = 'ko-portal-mock-session';
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

export type PortalAuthValue = {
  isLoaded: boolean;
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
};

const PortalAuthContext = createContext<PortalAuthValue | null>(null);

function subscribeMockSession(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener('ko-portal-mock-session', onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener('ko-portal-mock-session', onStoreChange);
  };
}

function getMockSessionSnapshot() {
  return sessionStorage.getItem(MOCK_SESSION_KEY) === '1';
}

function getServerMockSessionSnapshot() {
  return false;
}

export function setMockPortalSession() {
  sessionStorage.setItem(MOCK_SESSION_KEY, '1');
  window.dispatchEvent(new Event('ko-portal-mock-session'));
}

export function clearMockPortalSession() {
  sessionStorage.removeItem(MOCK_SESSION_KEY);
  window.dispatchEvent(new Event('ko-portal-mock-session'));
}

export function hasMockPortalSession() {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem(MOCK_SESSION_KEY) === '1';
}

function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const mockActive = useSyncExternalStore(
    subscribeMockSession,
    getMockSessionSnapshot,
    getServerMockSessionSnapshot,
  );

  const value: PortalAuthValue = {
    isLoaded: true,
    isSignedIn: USE_MOCK && mockActive,
    getToken: async () => (mockActive ? 'mock-token' : null),
  };

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
}

function ClerkAuthBridge({ children }: { children: React.ReactNode }) {
  const auth = useClerkAuth();

  const value: PortalAuthValue = {
    isLoaded: auth.isLoaded,
    isSignedIn: auth.isSignedIn ?? false,
    getToken: auth.getToken,
  };

  return <PortalAuthContext.Provider value={value}>{children}</PortalAuthContext.Provider>;
}

function hasValidClerkKey() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
  return key.startsWith('pk_') && key.length > 20 && !key.includes('placeholder');
}

export function PortalAuthProvider({ children }: { children: React.ReactNode }) {
  if (hasValidClerkKey()) {
    return (
      <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}>
        <ClerkAuthBridge>{children}</ClerkAuthBridge>
      </ClerkProvider>
    );
  }

  return <MockAuthProvider>{children}</MockAuthProvider>;
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
    subscribeMockSession,
    getMockSessionSnapshot,
    getServerMockSessionSnapshot,
  );
}

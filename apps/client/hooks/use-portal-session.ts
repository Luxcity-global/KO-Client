'use client';

import { usePortalAuth } from '@/components/portal-auth-provider';
import { useMockPortalData } from '@/lib/api/invite-mode';
import { useQuery } from '@tanstack/react-query';
import { fetchPortalSession } from '@/lib/api/portal-data';

export function usePortalSession() {
  const { isSignedIn } = usePortalAuth();
  const useMock = useMockPortalData();

  return useQuery({
    queryKey: ['portal', 'session', useMock ? 'mock' : 'live'],
    enabled: isSignedIn,
    queryFn: () => fetchPortalSession(),
  });
}

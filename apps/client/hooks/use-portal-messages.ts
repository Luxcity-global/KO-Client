'use client';

import { usePortalAuth } from '@/components/portal-auth-provider';
import { useMockPortalData } from '@/lib/api/invite-mode';
import { useQuery } from '@tanstack/react-query';
import { fetchPortalMessages } from '@/lib/api/portal-data';

export function usePortalMessages() {
  const { isSignedIn } = usePortalAuth();
  const useMock = useMockPortalData();

  return useQuery({
    queryKey: ['portal', 'messages', useMock ? 'mock' : 'live'],
    enabled: isSignedIn,
    queryFn: () => fetchPortalMessages(),
  });
}

'use client';

import { usePortalAuth } from '@/components/portal-auth-provider';
import { useQuery } from '@tanstack/react-query';
import { fetchPortalMessages } from '@/lib/api/portal-data';
import { requireAuthToken } from '@/lib/api/errors';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

export function usePortalMessages() {
  const { getToken, isSignedIn } = usePortalAuth();

  return useQuery({
    queryKey: ['portal', 'messages'],
    enabled: isSignedIn,
    queryFn: async () => {
      if (USE_MOCK) {
        return fetchPortalMessages();
      }
      const token = await requireAuthToken(getToken);
      return fetchPortalMessages(token);
    },
  });
}

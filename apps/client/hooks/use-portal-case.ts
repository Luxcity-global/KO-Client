'use client';

import { usePortalAuth } from '@/components/portal-auth-provider';
import { useQuery } from '@tanstack/react-query';
import { fetchPortalCase } from '@/lib/api/portal-data';
import { requireAuthToken } from '@/lib/api/errors';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

export function usePortalCase() {
  const { getToken, isSignedIn } = usePortalAuth();

  return useQuery({
    queryKey: ['portal', 'case'],
    enabled: isSignedIn,
    queryFn: async () => {
      if (USE_MOCK) {
        return fetchPortalCase();
      }
      const token = await requireAuthToken(getToken);
      return fetchPortalCase(token);
    },
  });
}

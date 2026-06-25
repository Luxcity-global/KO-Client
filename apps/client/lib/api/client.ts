import type { ApiResponse } from '@ko/types';

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public fields?: Record<string, string[]>,
    public status?: number,
    public details?: string[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function portalFetch<T>(
  path: string,
  options: RequestInit & { token?: string; portalToken?: string } = {},
): Promise<ApiResponse<T>> {
  const headers = new Headers(options.headers);

  if (options.token) {
    headers.set('Authorization', `Bearer ${options.token}`);
  }

  if (options.portalToken) {
    headers.set('X-Portal-Token', options.portalToken);
  }

  if (!(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  return res.json() as Promise<ApiResponse<T>>;
}

export function unwrapPortalResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiError(
      response.error.code,
      response.error.message,
      response.error.fields,
      undefined,
      response.error.details,
    );
  }

  return response.data;
}

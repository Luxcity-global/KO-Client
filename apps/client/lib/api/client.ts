import type { ApiResponse } from '@ko/types';

/** Same-origin via Next.js rewrite — cookies work for portal session auth. */
const BASE_URL = '';

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

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  let body: ApiResponse<T>;
  try {
    body = (await res.json()) as ApiResponse<T>;
  } catch {
    throw new ApiError(
      'INTERNAL_ERROR',
      res.statusText || 'Request failed',
      undefined,
      res.status,
    );
  }

  if (!res.ok && body.success === false) {
    throw new ApiError(
      body.error.code,
      body.error.message,
      body.error.fields,
      res.status,
      body.error.details,
    );
  }

  if (!res.ok) {
    throw new ApiError('INTERNAL_ERROR', res.statusText || 'Request failed', undefined, res.status);
  }

  return body;
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

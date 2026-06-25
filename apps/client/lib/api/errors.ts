import { ApiError } from '@/lib/api/client';

export const API_ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ApiErrorCode = (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHORIZED: 'Session expired. Please sign in again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check the highlighted fields and try again.',
  INTERNAL_ERROR: 'An unexpected error occurred. Please try again.',
};

export function isApiErrorCode(err: unknown, code: ApiErrorCode): boolean {
  return err instanceof ApiError && err.code === code;
}

export function getApiErrorCode(err: unknown): string | undefined {
  return err instanceof ApiError ? err.code : undefined;
}

export function formatApiError(err: unknown, options?: { fallback?: string }): string {
  if (err instanceof ApiError) {
    const known = DEFAULT_MESSAGES[err.code as ApiErrorCode];
    if (known) return err.message || known;
    return err.message || options?.fallback || DEFAULT_MESSAGES.INTERNAL_ERROR;
  }

  if (err instanceof Error && err.message) return err.message;
  return options?.fallback ?? DEFAULT_MESSAGES.INTERNAL_ERROR;
}

export async function requireAuthToken(
  getToken: () => Promise<string | null>,
): Promise<string> {
  const token = await getToken();
  if (!token) {
    throw new ApiError(API_ERROR_CODES.UNAUTHORIZED, DEFAULT_MESSAGES.UNAUTHORIZED, undefined, 401);
  }
  return token;
}

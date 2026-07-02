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

export function isAccountAlreadyConfiguredError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;

  const code = err.code.toUpperCase();
  if (
    code === 'ACCOUNT_ALREADY_CONFIGURED' ||
    code === 'ALREADY_CONFIGURED' ||
    code === 'CONFLICT' ||
    code === 'ACCOUNT_EXISTS'
  ) {
    return true;
  }

  const message = err.message.toLowerCase();
  return (
    message.includes('already configured') ||
    message.includes('already exists') ||
    message.includes('already set up') ||
    message.includes('already been set up')
  );
}

export function isInviteTokenConsumedError(err: unknown): boolean {
  if (!(err instanceof ApiError)) return false;
  if (err.code !== 'NOT_FOUND') return false;
  const message = err.message.toLowerCase();
  return message.includes('invite token') || message.includes('expired');
}

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

  if (err instanceof TypeError) {
    return 'Cannot reach the portal API. Ensure KO-Broker is running on the configured API URL.';
  }

  if (err instanceof Error && err.message) return err.message;
  return options?.fallback ?? DEFAULT_MESSAGES.INTERNAL_ERROR;
}

export async function requireAuthToken(
  getToken: () => Promise<string | null>,
): Promise<string | undefined> {
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';
  if (!USE_MOCK) {
    return undefined;
  }

  const token = await getToken();
  if (!token) {
    throw new ApiError(API_ERROR_CODES.UNAUTHORIZED, DEFAULT_MESSAGES.UNAUTHORIZED, undefined, 401);
  }
  return token;
}

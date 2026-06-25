import { NextResponse } from 'next/server';
import type { ApiSuccessResponse } from '@ko/types';

export function apiSuccess<T>(
  data: T,
  init?: ResponseInit & { meta?: ApiSuccessResponse<T>['meta'] },
) {
  const { meta, ...responseInit } = init ?? {};
  const body: ApiSuccessResponse<T> = { success: true, data };
  if (meta) body.meta = meta;
  return NextResponse.json(body, responseInit);
}

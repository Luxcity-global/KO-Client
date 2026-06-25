import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    service: 'ko-client-platform',
    timestamp: new Date().toISOString(),
  });
}

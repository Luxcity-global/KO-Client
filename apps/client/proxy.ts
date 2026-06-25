import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest } from 'next/server';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

function hasValidClerkKey() {
  const key = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ?? '';
  return key.startsWith('pk_') && key.length > 20 && !key.includes('placeholder');
}

const isPublicRoute = createRouteMatcher(['/invite(.*)', '/verify(.*)', '/api/health']);

function mockMiddleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/invite', req.url));
  }
  return NextResponse.next();
}

const clerkHandler = clerkMiddleware(async (auth, req) => {
  if (req.nextUrl.pathname === '/') {
    const { userId } = await auth();
    const destination = userId ? '/overview' : '/invite';
    return NextResponse.redirect(new URL(destination, req.url));
  }

  if (isPublicRoute(req)) return;

  if (req.nextUrl.pathname.startsWith('/api/')) return;

  await auth.protect();
});

export default USE_MOCK || !hasValidClerkKey() ? mockMiddleware : clerkHandler;

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};

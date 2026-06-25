import { redirect } from 'next/navigation';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';

export default async function HomePage() {
  if (USE_MOCK) {
    redirect('/invite');
  }

  const { auth } = await import('@clerk/nextjs/server');
  const { userId } = await auth();

  if (userId) {
    redirect('/overview');
  }

  redirect('/invite');
}

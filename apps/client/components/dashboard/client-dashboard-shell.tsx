'use client';

import { ClientDashboardNav } from '@/components/dashboard/client-dashboard-nav';

export function ClientDashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-surface lg:flex-row">
      <ClientDashboardNav />
      <main className="min-w-0 flex-1 overflow-y-auto p-4 pb-20 md:p-8 lg:pb-8">{children}</main>
    </div>
  );
}

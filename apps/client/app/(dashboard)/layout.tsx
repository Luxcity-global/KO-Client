import { ClientAuthGuard } from '@/components/auth/client-auth-guard';
import { ClientDashboardShell } from '@/components/dashboard/client-dashboard-shell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientAuthGuard>
      <ClientDashboardShell>{children}</ClientDashboardShell>
    </ClientAuthGuard>
  );
}

'use client';

import { LogOut, Settings, Bell, Mail, MessageSquare } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { clearMockPortalSession } from '@/components/portal-auth-provider';
import { usePortalSession } from '@/hooks/use-portal-session';

type NotificationSettings = {
  inApp: boolean;
  email: boolean;
  sms: boolean;
};

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-teal-400 focus-visible:ring-offset-2 ${
        checked ? 'bg-[#19a873]' : 'bg-[#d4d4d8]'
      }`}
    >
      <span
        className={`h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(13,31,26,0.2)] transition-transform ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );
}

export default function SettingsPageClient() {
  const router = useRouter();
  const { data } = usePortalSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState<NotificationSettings>({
    inApp: true,
    email: true,
    sms: true,
  });

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      clearMockPortalSession();
      router.replace('/invite');
    } finally {
      setIsLoggingOut(false);
    }
  }

  const fullName = data ? `${data.client.firstName} ${data.client.lastName}` : '';
  const signedInEmail = data?.client.email ?? 'client@example.com';

  return (
    <div className="mx-auto max-w-lg space-y-8 lg:max-w-5xl">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      {/* Mobile */}
      <header className="lg:hidden">
        <p className="text-xs font-semibold uppercase tracking-widest text-ink-60">Account</p>
        <h1 className="mt-1 font-heading text-3xl font-bold text-ink">Settings</h1>
      </header>
      {/* Desktop — original style */}
      <header className="hidden space-y-2 lg:block">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-brand-teal-700" />
          <h1 className="font-heading text-3xl font-bold text-ink">Settings</h1>
        </div>
      </header>

      {/* ── Profile card (mobile only) ───────────────────────────────────── */}
      <section className="lg:hidden">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-ink-60">Profile</p>
        <div className="overflow-hidden rounded-2xl border border-ink-08 bg-white">
          <div className="flex items-center gap-4 px-4 py-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-teal-50 font-heading text-lg font-bold text-brand-teal-700">
              {data?.client.firstName?.[0] ?? '?'}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-ink">{fullName}</p>
              <p className="truncate text-sm text-ink-60">{signedInEmail}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Notifications / Messaging ─────────────────────────────────────── */}
      <section className="space-y-4">
        {/* Mobile section header */}
        <p className="text-xs font-bold uppercase tracking-widest text-ink-60 lg:hidden">
          Notifications
        </p>
        {/* Desktop section header — original style */}
        <div className="hidden lg:block">
          <h2 className="font-heading text-2xl text-ink">Messaging</h2>
          <p className="mt-1 text-sm text-ink-60">
            Configure which delivery channels are available when advisers send messages.
          </p>
        </div>

        {/* Mobile: compact icon rows */}
        <div className="overflow-hidden rounded-2xl border border-ink-08 bg-white divide-y divide-ink-08 lg:hidden">
          {[
            { icon: Bell, label: 'In-app', description: 'Show updates in your dashboard', key: 'inApp' as const },
            { icon: Mail, label: 'Email', description: 'Receive updates at your email address', key: 'email' as const },
            { icon: MessageSquare, label: 'SMS', description: 'Receive text alerts on your mobile', key: 'sms' as const },
          ].map(({ icon: Icon, label, description, key }) => (
            <div key={key} className="flex items-center justify-between gap-4 px-4 py-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-teal-50 text-brand-teal-700">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{label}</p>
                  <p className="mt-0.5 text-xs leading-snug text-ink-60">{description}</p>
                </div>
              </div>
              <Toggle
                checked={notifications[key]}
                onChange={(v) => setNotifications((p) => ({ ...p, [key]: v }))}
              />
            </div>
          ))}
        </div>

        {/* Desktop: original larger rows */}
        <div className="hidden space-y-4 rounded-2xl border border-ink-20 bg-white p-5 lg:block">
          <div className="flex items-center justify-between rounded-xl border border-ink-20 px-4 py-3">
            <div>
              <h3 className="text-xl font-semibold text-ink">In-app messages</h3>
              <p className="mt-1 text-sm text-ink-60">
                Show messages in the dashboard thread and client portal.
              </p>
            </div>
            <Toggle
              checked={notifications.inApp}
              onChange={(v) => setNotifications((p) => ({ ...p, inApp: v }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-ink-20 px-4 py-3">
            <div>
              <h3 className="text-xl font-semibold text-ink">Email</h3>
              <p className="mt-1 text-sm text-ink-60">
                Send a copy to the client&apos;s email address (via Resend).
              </p>
            </div>
            <Toggle
              checked={notifications.email}
              onChange={(v) => setNotifications((p) => ({ ...p, email: v }))}
            />
          </div>
          <div className="flex items-center justify-between rounded-xl border border-ink-20 px-4 py-3">
            <div>
              <h3 className="text-xl font-semibold text-ink">SMS</h3>
              <p className="mt-1 text-sm text-ink-60">
                Send a text to the client&apos;s mobile number (via Twilio).
              </p>
            </div>
            <Toggle
              checked={notifications.sms}
              onChange={(v) => setNotifications((p) => ({ ...p, sms: v }))}
            />
          </div>
        </div>
      </section>

      {/* ── Account / Sign out ────────────────────────────────────────────── */}
      <section className="space-y-4">
        {/* Mobile section header */}
        <p className="text-xs font-bold uppercase tracking-widest text-ink-60 lg:hidden">Account</p>
        {/* Desktop section header — original */}
        <div className="hidden lg:block">
          <h2 className="font-heading text-2xl text-ink">Account</h2>
          <p className="mt-1 text-sm text-ink-60">Sign out of KO Platform on this device.</p>
        </div>

        <div className="rounded-2xl border border-ink-08 bg-white lg:rounded-2xl lg:border-ink-20">
          <div className="px-4 py-5">
            <p className="text-sm text-ink-60">
              Signed in as <span className="font-semibold text-ink">{signedInEmail}</span>
            </p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#E95454] py-3 text-sm font-semibold text-white transition hover:bg-[#d84a4a] disabled:cursor-not-allowed disabled:opacity-70 lg:inline-flex lg:w-auto lg:px-4"
            >
              <LogOut className="h-4 w-4" />
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

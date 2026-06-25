'use client';

import { LogOut, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { clearMockPortalSession } from '@/components/portal-auth-provider';
import { usePortalSession } from '@/hooks/use-portal-session';

type MessagingSettings = {
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
  const [messaging, setMessaging] = useState<MessagingSettings>({
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

  const signedInEmail = data?.client.email ?? 'client@example.com';

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <header className="space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-brand-teal-700" />
          <h1 className="font-heading text-3xl font-bold text-ink">Settings</h1>
        </div>
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-2xl text-ink">Messaging</h2>
          <p className="mt-1 text-sm text-ink-60">
            Configure which delivery channels are available when advisers send messages.
          </p>
        </div>

        <div className="space-y-4 rounded-2xl border border-ink-20 bg-white p-5">
          <div className="flex items-center justify-between rounded-xl border border-ink-20 px-4 py-3">
            <div>
              <h3 className="text-xl font-semibold text-ink">In-app messages</h3>
              <p className="mt-1 text-sm text-ink-60">
                Show messages in the dashboard thread and client portal.
              </p>
            </div>
            <Toggle
              checked={messaging.inApp}
              onChange={(next) => setMessaging((prev) => ({ ...prev, inApp: next }))}
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
              checked={messaging.email}
              onChange={(next) => setMessaging((prev) => ({ ...prev, email: next }))}
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
              checked={messaging.sms}
              onChange={(next) => setMessaging((prev) => ({ ...prev, sms: next }))}
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="font-heading text-2xl text-ink">Account</h2>
          <p className="mt-1 text-sm text-ink-60">Sign out of KO Platform on this device.</p>
        </div>

        <div className="rounded-2xl border border-ink-20 bg-white p-5">
          <p className="text-sm text-ink-60">
            Signed in as <span className="font-semibold text-ink">{signedInEmail}</span>
          </p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#E95454] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#d84a4a] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? 'Logging out...' : 'Log out'}
          </button>
        </div>
      </section>
    </div>
  );
}

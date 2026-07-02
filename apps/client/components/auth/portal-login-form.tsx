'use client';

import { useState } from 'react';
import { ArrowRight, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

type PortalLoginFormProps = {
  defaultEmail?: string;
  emailReadOnly?: boolean;
  loading?: boolean;
  error?: string | null;
  submitLabel?: string;
  loadingLabel?: string;
  mockHint?: boolean;
  onSubmit: (email: string, password: string) => Promise<void>;
};

export function PortalLoginForm({
  defaultEmail = '',
  emailReadOnly = false,
  loading = false,
  error = null,
  submitLabel = 'Sign in',
  loadingLabel = 'Signing in…',
  mockHint = false,
  onSubmit,
}: PortalLoginFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void onSubmit(email.trim(), password);
      }}
      className="space-y-4"
    >
      <div className="space-y-1.5">
        <label htmlFor="portal-login-email" className="text-sm font-medium text-[#18181b]">
          Email
        </label>
        <input
          id="portal-login-email"
          type="email"
          autoComplete="email"
          required
          readOnly={emailReadOnly}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-12 w-full rounded-xl border border-[#e4e4e7] px-4 text-sm text-[#18181b] placeholder:text-[#a1a1aa] read-only:bg-[#fafafa] read-only:text-[#71717a] focus:border-brand-teal-700 focus:outline-none focus:ring-2 focus:ring-brand-teal-700/20"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="portal-login-password" className="text-sm font-medium text-[#18181b]">
          Password
        </label>
        <div className="relative">
          <input
            id="portal-login-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="h-12 w-full rounded-xl border border-[#e4e4e7] px-4 pr-11 text-sm text-[#18181b] placeholder:text-[#a1a1aa] focus:border-brand-teal-700 focus:outline-none focus:ring-2 focus:ring-brand-teal-700/20"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#71717a]"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button
        type="submit"
        className="h-12 w-full rounded-xl text-base"
        disabled={loading || !email || !password}
      >
        <ArrowRight className="h-4 w-4" />
        {loading ? loadingLabel : submitLabel}
      </Button>

      {mockHint && (
        <p className="text-center text-xs text-[#a1a1aa]">
          Mock mode: any email and password will sign you in.
        </p>
      )}
    </form>
  );
}

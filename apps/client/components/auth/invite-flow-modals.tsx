'use client';

import { useCallback, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  RefreshCw,
  X,
  XCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PortalLoginForm } from '@/components/auth/portal-login-form';
import {
  clearMockPortalSession,
  setMockPortalSession,
  setPortalSignedIn,
} from '@/components/portal-auth-provider';
import {
  loginPortal,
  sendInviteOtp,
  setupPortalAccount,
  storeClientProfile,
  verifyInviteOtp,
  type InviteValidation,
} from '@/lib/api/portal-data';
import { useMockForInvite, useMockPortalData } from '@/lib/api/invite-mode';
import { formatApiError, isAccountAlreadyConfiguredError, isInviteTokenConsumedError } from '@/lib/api/errors';
import { markAccountConfigured } from '@/lib/api/invite-context';

const MOCK_OTP_CODE = '123456';
const MAX_ATTEMPTS = 3;

export type InviteFlowStep =
  | 'welcome'
  | 'set-password'
  | 'otp'
  | 'error'
  | 'verified'
  | 'login';

type InviteFlowModalsProps = {
  invite: InviteValidation;
  token: string;
  step: InviteFlowStep;
  onStepChange: (step: InviteFlowStep) => void;
  onVerified: () => void;
};

function maskEmail(email: string) {
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  return `${local[0]}***@${domain}`;
}

function OtpDigitInputs({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, ' ').split('').slice(0, 6);

  function updateAt(i: number, char: string) {
    const arr = value.padEnd(6, ' ').split('').slice(0, 6);
    arr[i] = char;
    onChange(arr.join('').replace(/ /g, '').slice(0, 6));
  }

  return (
    <div className="flex justify-center gap-2">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputsRef.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={d.trim()}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, '').slice(-1);
            updateAt(i, v);
            if (v && i < 5) inputsRef.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[i]?.trim() && i > 0) {
              inputsRef.current[i - 1]?.focus();
            }
          }}
          className="h-12 w-11 rounded-xl border border-[#e4e4e7] text-center text-lg font-semibold text-[#18181b] focus:border-brand-teal-700 focus:outline-none focus:ring-2 focus:ring-brand-teal-700/20"
        />
      ))}
    </div>
  );
}

export function InviteFlowModals({
  invite,
  token,
  step,
  onStepChange,
  onVerified,
}: InviteFlowModalsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [sendError, setSendError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const clientFirstName = invite.client.firstName;
  const clientName = `${invite.client.firstName} ${invite.client.lastName}`;
  const adviserName = `${invite.adviser.firstName} ${invite.adviser.lastName}`;
  const useMockInvite = useMockForInvite(token);

  const handleSendVerification = useCallback(async () => {
    setLoading(true);
    setSendError(null);
    try {
      await sendInviteOtp(token);
      onStepChange('otp');
    } catch (err) {
      setSendError(err instanceof Error ? err.message : 'Failed to send code');
    } finally {
      setLoading(false);
    }
  }, [token, onStepChange]);

  const handleSetPassword = useCallback(async () => {
    setPasswordError(null);
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setSendError(null);
    try {
      if (useMockInvite) {
        await sendInviteOtp(token);
        onStepChange('otp');
        return;
      }

      await setupPortalAccount(token, password);
      storeClientProfile(invite.client);
      markAccountConfigured(invite.client.email);
      setPortalSignedIn();
      onStepChange('verified');
    } catch (err) {
      if (isAccountAlreadyConfiguredError(err) || isInviteTokenConsumedError(err)) {
        markAccountConfigured(invite.client.email);
        onStepChange('login');
        return;
      }
      setPasswordError(err instanceof Error ? err.message : 'Failed to set up account');
    } finally {
      setLoading(false);
    }
  }, [password, confirmPassword, token, onStepChange, invite.client, useMockInvite]);

  const handleLogin = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setLoginError(null);
      try {
        if (!useMockInvite) {
          clearMockPortalSession();
        }
        await loginPortal(email, password);
        storeClientProfile({ ...invite.client, email });
        markAccountConfigured(email);
        setPortalSignedIn();
        router.replace('/overview');
      } catch (err) {
        if (useMockInvite) {
          setMockPortalSession();
          router.replace('/overview');
          return;
        }
        setLoginError(formatApiError(err, { fallback: 'Login failed. Please check your credentials.' }));
      } finally {
        setLoading(false);
      }
    },
    [invite.client, router, useMockInvite],
  );

  const handleVerify = useCallback(async () => {
    if (otp.length < 6) return;
    setLoading(true);

    if (useMockInvite && otp !== MOCK_OTP_CODE) {
      await new Promise((r) => setTimeout(r, 500));
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      setLoading(false);
      onStepChange('error');
      return;
    }

    try {
      await verifyInviteOtp(token, otp);
      onStepChange('verified');
    } catch {
      const remaining = attemptsLeft - 1;
      setAttemptsLeft(remaining);
      onStepChange('error');
    } finally {
      setLoading(false);
    }
  }, [otp, token, attemptsLeft, onStepChange, useMockInvite]);

  const handleBeginFactFind = useCallback(() => {
    if (useMockInvite) {
      setMockPortalSession();
    }
    onVerified();
    router.replace('/application');
  }, [onVerified, router, useMockInvite]);

  if (step === 'login') {
    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#0d1f1a]/45 p-4 backdrop-blur-[2px]">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-teal-50 text-brand-teal-700">
            <KeyRound className="h-6 w-6" aria-hidden />
          </div>
          <h2 className="text-center font-heading text-2xl font-bold text-[#18181b]">
            Welcome back, {clientFirstName}
          </h2>
          <p className="mt-2 text-center text-sm text-[#71717a]">
            Your portal account is already set up. Sign in with your email and password to access
            your dashboard.
          </p>
          <div className="mt-6">
            <PortalLoginForm
              defaultEmail={invite.client.email}
              emailReadOnly
              loading={loading}
              error={loginError}
              mockHint={useMockPortalData() && useMockInvite}
              onSubmit={handleLogin}
            />
          </div>
        </div>
      </div>
    );
  }

  if (step === 'welcome') {
    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#0d1f1a]/45 p-4 backdrop-blur-[2px]">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mx-auto mb-4 flex justify-center">
            <Image
              src="/assets/invite-welcome.png"
              alt=""
              width={180}
              height={180}
              className="object-contain"
              priority
            />
          </div>
          <h2 className="text-center font-heading text-2xl font-bold text-[#18181b]">
            Welcome to KO Brokers
          </h2>
          <p className="mt-4 text-center text-sm leading-relaxed text-[#52525b]">
            Hi <strong>{clientName}</strong>, you have been invited by <strong>{adviserName}</strong>{' '}
            to complete a fact find form to aid case{' '}
            <strong>{invite.case.referenceNumber}</strong>.
            <br />
            <br />
            {useMockInvite ? (
              <>
                To get started, you&apos;ll create a password then verify your email{' '}
                <strong>{invite.client.email}</strong>.
              </>
            ) : (
              <>
                To get started, create a password for your portal account using{' '}
                <strong>{invite.client.email}</strong>.
              </>
            )}
          </p>
          {sendError && <p className="mt-3 text-center text-sm text-red-600">{sendError}</p>}
          <Button
            className="mt-6 h-12 w-full rounded-xl text-base"
            onClick={() => onStepChange('set-password')}
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (step === 'set-password') {
    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#0d1f1a]/45 p-4 backdrop-blur-[2px]">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-teal-50 text-brand-teal-700">
            <KeyRound className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">
            {useMockInvite ? 'Step 1 of 2' : 'Account setup'}
          </p>
          <h2 className="mt-2 text-center font-heading text-2xl font-bold text-[#18181b]">
            Create your password
          </h2>
          <p className="mt-2 text-center text-sm text-[#71717a]">
            Choose a secure password for your KO Platform account.
          </p>

          <div className="mt-6 space-y-4">
            {/* Password field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#18181b]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="At least 8 characters"
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

            {/* Confirm password field */}
            <div className="space-y-1.5">
              <label htmlFor="confirm-password" className="text-sm font-medium text-[#18181b]">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirm-password"
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setPasswordError(null);
                  }}
                  placeholder="Re-enter your password"
                  className="h-12 w-full rounded-xl border border-[#e4e4e7] px-4 pr-11 text-sm text-[#18181b] placeholder:text-[#a1a1aa] focus:border-brand-teal-700 focus:outline-none focus:ring-2 focus:ring-brand-teal-700/20"
                />
                <button
                  type="button"
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a1a1aa] hover:text-[#71717a]"
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Inline error */}
            {passwordError && (
              <div className="flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" aria-hidden />
                <p className="text-sm text-red-600">{passwordError}</p>
              </div>
            )}

            {/* Hint */}
            {!passwordError && (
              <p className="text-xs text-[#a1a1aa]">
                Must be at least 8 characters.
              </p>
            )}
          </div>

          <Button
            className="mt-6 h-12 w-full rounded-xl text-base"
            onClick={() => void handleSetPassword()}
            disabled={loading || !password || !confirmPassword}
            variant={!password || !confirmPassword ? 'outline' : 'default'}
          >
            {useMockInvite ? <Mail className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
            {loading
              ? useMockInvite
                ? 'Sending code…'
                : 'Creating account…'
              : useMockInvite
                ? 'Continue'
                : 'Create account'}
          </Button>
          <button
            type="button"
            className="mt-4 w-full text-center text-sm text-[#71717a] hover:text-brand-teal-700"
            onClick={() => onStepChange('welcome')}
          >
            ← Back
          </button>
        </div>
      </div>
    );
  }

  if (step === 'otp' && useMockInvite) {
    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#0d1f1a]/45 p-4 backdrop-blur-[2px]">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-teal-50 text-brand-teal-700">
            <Mail className="h-6 w-6" aria-hidden />
          </div>
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-[#a1a1aa]">
            Step 2 of 2
          </p>
          <h2 className="mt-2 text-center font-heading text-2xl font-bold text-[#18181b]">
            Enter your code
          </h2>
          <p className="mt-2 text-center text-sm text-[#71717a]">
            We sent a 6-digit code to {maskEmail(invite.client.email)}
          </p>
          <div className="mt-8">
            <OtpDigitInputs value={otp} onChange={setOtp} disabled={loading} />
          </div>
          <Button
            className="mt-8 h-12 w-full rounded-xl text-base"
            onClick={handleVerify}
            disabled={loading || otp.length < 6}
            variant={otp.length < 6 ? 'outline' : 'default'}
          >
            <ArrowRight className="h-4 w-4" />
            {loading ? 'Verifying…' : 'Verify Code'}
          </Button>
          <button
            type="button"
            className="mt-4 w-full text-center text-sm text-[#71717a] hover:text-brand-teal-700"
            onClick={() => void handleSendVerification()}
          >
            Didn&apos;t receive it? Resend code
          </button>
          <p className="mt-3 text-center text-xs text-[#a1a1aa]">
            Mock mode: use code <strong>123456</strong>
          </p>
        </div>
      </div>
    );
  }

  if (step === 'error' && useMockInvite) {
    return (
      <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#0d1f1a]/45 p-4 backdrop-blur-[2px]">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <XCircle className="h-8 w-8 text-red-600" aria-hidden />
          </div>
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-red-600">
            Verification failed
          </p>
          <h2 className="mt-2 text-center font-heading text-2xl font-bold text-[#18181b]">
            Incorrect code
          </h2>
          <p className="mt-2 text-center text-sm text-[#71717a]">
            The code you entered was incorrect. You have {attemptsLeft} attempt
            {attemptsLeft === 1 ? '' : 's'} remaining.
          </p>
          <div className="mt-6 flex gap-3 rounded-xl border border-red-100 bg-red-50 p-4">
            <X className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden />
            <div>
              <p className="text-sm font-semibold text-[#18181b]">Check your email</p>
              <p className="mt-1 text-xs text-[#71717a]">
                Please ensure you are entering the most recent code. Codes expire after 10 minutes.
              </p>
            </div>
          </div>
          <Button
            className="mt-6 h-12 w-full rounded-xl bg-red-600 text-base hover:bg-red-700"
            onClick={() => {
              setOtp('');
              onStepChange('otp');
            }}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center bg-[#0d1f1a]/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-teal-50">
          <Check className="h-8 w-8 text-brand-teal-700" strokeWidth={2.5} aria-hidden />
        </div>
        <p className="text-center text-[11px] font-bold uppercase tracking-widest text-brand-teal-700">
          Identity verified
        </p>
        <h2 className="mt-2 text-center font-heading text-2xl font-bold text-[#18181b]">
          You&apos;re verified, {clientFirstName}!
        </h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-[#71717a]">
          Your identity has been confirmed. You can now begin filling in your fact-find form. This
          should take around 10–15 minutes.
        </p>
        <div className="mt-6 rounded-xl border border-brand-teal-100 bg-brand-teal-50 p-4 text-sm text-[#52525b]">
          <strong className="text-[#18181b]">What happens next?</strong>
          <p className="mt-1">
            Complete each section at your own pace. Your adviser will review your answers once you
            submit.
          </p>
        </div>
        <Button className="mt-6 h-12 w-full rounded-xl text-base" onClick={handleBeginFactFind}>
          Begin Fact-Find
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

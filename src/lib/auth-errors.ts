import type { AuthError } from '@supabase/supabase-js';

/**
 * Maps raw Supabase auth errors to friendly, HONEST messages.
 *
 * Important: Supabase returns the same `invalid_credentials` error for both a
 * non-existent email AND a wrong password (deliberate anti-enumeration). So on
 * login we cannot truthfully say "no account exists" — doing so would mislead a
 * user who simply mistyped their password. Instead we nudge toward signup while
 * staying accurate. The reliable "account already exists" signal lives on the
 * SIGNUP path (see signup.tsx), not here.
 */
export function friendlyAuthError(
  error: Pick<AuthError, 'message' | 'code'> | null,
  context: 'login' | 'signup',
): string | null {
  if (!error) return null;
  const code = error.code ?? '';
  const msg = error.message ?? '';

  if (code === 'invalid_credentials' || /invalid login credentials/i.test(msg)) {
    return context === 'login'
      ? "We couldn't log you in. Double-check your password — or if you don't have an account yet, tap Sign up below."
      : msg;
  }
  if (code === 'email_not_confirmed' || /email not confirmed/i.test(msg)) {
    return 'Please confirm your email first (check your inbox), then log in.';
  }
  if (
    code === 'user_already_exists' ||
    code === 'email_exists' ||
    /already registered|already.*exists/i.test(msg)
  ) {
    return 'That email already has an account. Try logging in instead.';
  }
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit' || /rate limit/i.test(msg)) {
    return 'Too many attempts. Please wait a minute, then try again.';
  }
  if (code === 'weak_password' || /password should be|at least 6/i.test(msg)) {
    return 'Password must be at least 6 characters.';
  }

  // Fallback: surface the original message rather than hide it.
  return msg || 'Something went wrong. Please try again.';
}

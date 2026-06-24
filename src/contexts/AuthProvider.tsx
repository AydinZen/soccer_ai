import type { Session, User } from '@supabase/supabase-js';
import { createContext, use, useEffect, useState, type ReactNode } from 'react';

import { getProfile } from '@/lib/profiles';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types/profile';

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** True until the first session check resolves (controls the splash gate). */
  isLoading: boolean;
  /** True once the one-time profile setup is complete (name + position + skill). */
  hasProfile: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const value = use(AuthContext); // React 19 `use` to read context
  if (!value) throw new Error('useAuth must be used within <AuthProvider />');
  return value;
}

// The profile is "complete" once the required setup fields are filled. The
// trigger seeds a row with nulls at signup, so these stay null until the user
// finishes profile-setup.
function isComplete(p: Profile | null): boolean {
  return !!(p && p.full_name && p.position && p.skill_level);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadProfile(userId: string) {
      try {
        const p = await getProfile(userId);
        if (active) setProfile(p);
      } catch {
        if (active) setProfile(null);
      }
    }

    // Fast local hydration (reads storage, no network).
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id).finally(() => {
          if (active) setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
      if (nextSession) {
        // Defer the DB read out of the callback to avoid auth deadlocks.
        setTimeout(() => {
          loadProfile(nextSession.user.id);
        }, 0);
      } else {
        setProfile(null);
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    const { data } = await supabase.auth.getSession();
    const uid = data.session?.user.id;
    if (!uid) {
      setProfile(null);
      return;
    }
    try {
      setProfile(await getProfile(uid));
    } catch {
      // keep the previous profile on a transient failure
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        isLoading,
        hasProfile: isComplete(profile),
        refreshProfile,
        signOut,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

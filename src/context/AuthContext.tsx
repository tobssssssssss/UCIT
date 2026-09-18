import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, type Profile } from '@/lib/supabase';

type AuthContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, nick: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', uid)
      .maybeSingle();
    setProfile(data as Profile | null);
  };

  const refreshProfile = async () => {
    if (session?.user?.id) {
      await fetchProfile(session.user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      if (s?.user?.id) {
        fetchProfile(s.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (s?.user?.id) {
        (async () => {
          await fetchProfile(s.user.id);
          await supabase
            .from('profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', s.user.id);

          if (event === 'SIGNED_IN') {
            const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-discord`;
            fetch(fnUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({
                type: 'login',
                data: {
                  nick: s.user.user_metadata?.nick ?? s.user.email?.split('@')[0] ?? '—',
                  full_name: s.user.user_metadata?.full_name ?? '—',
                  email: s.user.email ?? '—',
                },
              }),
            }).catch(() => {});
          }
        })();
      } else {
        setProfile(null);
      }
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUp = async (email: string, password: string, nick: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nick, full_name: fullName } },
    });
    if (error) return { error: error.message };
    if (!data.user) return { error: 'Nepodarilo sa vytvoriť účet.' };
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

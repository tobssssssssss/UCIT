import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, type Nick } from '@/lib/supabase';

type AuthContextValue = {
  nick: string | null;
  profile: Nick | null;
  loading: boolean;
  signIn: (nick: string) => Promise<{ error: string | null }>;
  signUp: (nick: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'portal_nick';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [nick, setNick] = useState<string | null>(null);
  const [profile, setProfile] = useState<Nick | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (n: string) => {
    const { data } = await supabase
      .from('nicks')
      .select('*')
      .eq('nick', n)
      .maybeSingle();
    setProfile(data as Nick | null);
  };

  const refreshProfile = async () => {
    if (nick) await fetchProfile(nick);
  };

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setNick(stored);
      (async () => {
        await fetchProfile(stored);
        await supabase.rpc('update_last_login_nick', { p_nick: stored });
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
  }, []);

  const signIn = async (n: string) => {
    const trimmed = n.trim();
    if (trimmed.length < 2) return { error: 'Nick musí mať aspoň 2 znaky.' };

    const { data } = await supabase
      .from('nicks')
      .select('*')
      .eq('nick', trimmed)
      .maybeSingle();

    if (!data) return { error: 'Tento nick neexistuje. Zaregistruj sa.' };

    localStorage.setItem(STORAGE_KEY, trimmed);
    setNick(trimmed);
    setProfile(data as Nick);
    await supabase.rpc('update_last_login_nick', { p_nick: trimmed });

    notifyDiscord('login', { nick: trimmed, full_name: (data as Nick).full_name ?? '—' });

    return { error: null };
  };

  const signUp = async (n: string) => {
    const trimmed = n.trim();
    if (trimmed.length < 2) return { error: 'Nick musí mať aspoň 2 znaky.' };

    const { data: existing } = await supabase
      .from('nicks')
      .select('nick')
      .eq('nick', trimmed)
      .maybeSingle();

    if (existing) return { error: 'Tento nick už existuje. Prihlás sa.' };

    const { error } = await supabase.from('nicks').insert({ nick: trimmed });
    if (error) return { error: error.message };

    localStorage.setItem(STORAGE_KEY, trimmed);
    setNick(trimmed);
    await fetchProfile(trimmed);

    notifyDiscord('login', { nick: trimmed, full_name: '—' });

    return { error: null };
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setNick(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ nick, profile, loading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

function notifyDiscord(type: string, data: Record<string, unknown>) {
  const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/notify-discord`;
  fetch(fnUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({ type, data }),
  }).catch(() => {});
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

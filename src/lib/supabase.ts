import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Subject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  url: string;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
};

export type Nick = {
  nick: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
  last_login_at: string | null;
};


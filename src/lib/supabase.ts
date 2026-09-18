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

export type Message = {
  id: string;
  nick: string;
  full_name: string;
  subject_id: string | null;
  content: string;
  suggested_price: number | null;
  is_read: boolean;
  created_at: string;
  subjects?: Pick<Subject, 'name'> | null;
};

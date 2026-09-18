/*
# Create Portal Schema — Subjects, Profiles, Messages, Admins, Settings

## Overview
This migration creates the full schema for a learning portal where users register with a nick,
see a list of subjects (each linking to an external app), can send messages to the admin (with optional
price suggestions), and an admin can manage subjects, view messages, and promote other admins.
Discord webhook notifications are sent via an edge function when someone logs in or sends a message.

## New Tables

1. `profiles`
   - `id` (uuid, PK, references auth.users)
   - `nick` (text, unique, not null) — the user's display name / nickname
   - `full_name` (text, nullable) — the user's real name (optional at registration)
   - `is_admin` (boolean, default false) — whether this user has admin privileges
   - `created_at` (timestamptz, default now())
   - `last_login_at` (timestamptz, nullable) — updated on each login

2. `subjects`
   - `id` (uuid, PK)
   - `name` (text, not null) — display name of the subject (e.g. "Biologia")
   - `slug` (text, unique, not null) — URL-safe identifier
   - `description` (text, nullable) — short description shown on the card
   - `url` (text, not null) — the external app URL this subject links to
   - `icon` (text, nullable) — lucide-react icon name for the card
   - `sort_order` (integer, default 0) — ordering of subject cards
   - `is_active` (boolean, default true) — whether the subject is visible to users
   - `created_at` (timestamptz, default now())

3. `messages`
   - `id` (uuid, PK)
   - `nick` (text, not null) — sender's nick (typed in the form, no login required)
   - `full_name` (text, not null) — sender's real name (typed in the form)
   - `subject_id` (uuid, nullable, references subjects) — optional: which subject the message is about
   - `content` (text, not null) — the message text
   - `suggested_price` (numeric, nullable) — optional price suggestion
   - `is_read` (boolean, default false) — admin can mark as read
   - `created_at` (timestamptz, default now())

4. `settings`
   - `id` (uuid, PK, default gen_random_uuid)
   - `key` (text, unique, not null) — setting key (e.g. 'discord_webhook_url')
   - `value` (text, nullable) — the setting value
   - `updated_at` (timestamptz, default now())

## Security (RLS)

- `profiles`: Users can read their own profile; admins can read all and update is_admin.
  is_admin is protected by a trigger — only existing admins can promote.
- `subjects`: Anyone (anon + authenticated) can read active subjects. Only admins can modify.
- `messages`: Anyone can insert (public contact form). Only admins can read/update/delete.
- `settings`: Only admins can read or write. The Discord webhook URL lives here.

## Important Notes

1. A trigger creates a profile row automatically on signup, copying nick from user_metadata.
2. The is_admin column is protected by a trigger — non-admins cannot change it.
3. Seed data: Biologia, Anglictina, Pod sem subjects with their GitHub URLs.
4. Discord webhook URL setting seeded as NULL (admin sets it via the admin panel).
*/

-- ============================================================
-- TABLE: profiles (must exist before is_admin() function)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nick text UNIQUE NOT NULL,
  full_name text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

-- ============================================================
-- HELPER FUNCTION: is_admin()
-- SECURITY DEFINER so RLS policies can call it without recursion
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT p.is_admin FROM public.profiles p WHERE p.id = auth.uid()),
    false
  );
$$;

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile; admins can read all
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile; admins can update any
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- ============================================================
-- TRIGGER: handle_new_user — auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nick, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nick', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: protect_is_admin — only admins can change is_admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.protect_is_admin()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
    IF NOT public.is_admin() THEN
      IF auth.uid() IS NOT NULL THEN
        RAISE EXCEPTION 'Only admins can change the is_admin field';
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_is_admin ON public.profiles;
CREATE TRIGGER trg_protect_is_admin
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_is_admin();

-- ============================================================
-- TABLE: subjects
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  url text NOT NULL,
  icon text,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "subjects_select_active" ON public.subjects;
CREATE POLICY "subjects_select_active"
  ON public.subjects FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "subjects_admin_insert" ON public.subjects;
CREATE POLICY "subjects_admin_insert"
  ON public.subjects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "subjects_admin_update" ON public.subjects;
CREATE POLICY "subjects_admin_update"
  ON public.subjects FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "subjects_admin_delete" ON public.subjects;
CREATE POLICY "subjects_admin_delete"
  ON public.subjects FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- TABLE: messages
-- ============================================================
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nick text NOT NULL,
  full_name text NOT NULL,
  subject_id uuid REFERENCES public.subjects(id) ON DELETE SET NULL,
  content text NOT NULL,
  suggested_price numeric(10,2),
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_insert_any" ON public.messages;
CREATE POLICY "messages_insert_any"
  ON public.messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "messages_select_admin" ON public.messages;
CREATE POLICY "messages_select_admin"
  ON public.messages FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "messages_update_admin" ON public.messages;
CREATE POLICY "messages_update_admin"
  ON public.messages FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "messages_delete_admin" ON public.messages;
CREATE POLICY "messages_delete_admin"
  ON public.messages FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- TABLE: settings
-- ============================================================
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_select_admin" ON public.settings;
CREATE POLICY "settings_select_admin"
  ON public.settings FOR SELECT
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "settings_insert_admin" ON public.settings;
CREATE POLICY "settings_insert_admin"
  ON public.settings FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "settings_update_admin" ON public.settings;
CREATE POLICY "settings_update_admin"
  ON public.settings FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- SEED DATA: subjects
-- ============================================================
INSERT INTO public.subjects (name, slug, description, url, icon, sort_order)
VALUES
  ('Biológia', 'biologia', 'Biológia — kvízy a precvičovanie', 'https://github.com/usbkluc/handy-quiz-coach', 'Leaf', 1),
  ('Angličtina', 'anglictina', 'Angličtina — učenie a precvičovanie', 'https://github.com/tobssssssssss/english', 'BookOpen', 2),
  ('Pod sem', 'pod-sem', 'Obchod — pod sem', 'https://github.com/alvero725/obchod', 'ShoppingBag', 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- SEED DATA: settings
-- ============================================================
INSERT INTO public.settings (key, value)
VALUES ('discord_webhook_url', NULL)
ON CONFLICT (key) DO NOTHING;

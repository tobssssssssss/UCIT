/*
# Switch to nick-only auth (no Supabase Auth)

## Overview
Removes the email/password auth requirement. Users now just enter a nick to enter the portal.
Admin operations go through SECURITY DEFINER RPC functions that verify the caller's nick is an admin.

## New Tables
- `nicks` — nick-based identity (no auth.users dependency)
  - nick (text, PK)
  - full_name (text, nullable)
  - is_admin (boolean, default false)
  - created_at, last_login_at

## New Functions (all SECURITY DEFINER)
- is_admin_nick(nick) — check admin status
- update_last_login_nick(nick) — update login timestamp
- claim_first_admin_nick(nick) — first user claims admin
- admin_set_admin_nick(caller, target, val) — toggle admin (admin only)
- admin_get_messages_nick(nick) — read messages (admin only)
- admin_get_profiles_nick(nick) — read all nicks (admin only)
- admin_get_setting_nick(nick, key) — read a setting (admin only)
- admin_set_setting_nick(nick, key, value) — write a setting (admin only)
- admin_add_subject_nick(...) — add subject (admin only)
- admin_update_subject_nick(...) — update subject (admin only)
- admin_delete_subject_nick(nick, id) — delete subject (admin only)
- admin_toggle_subject_active_nick(nick, id) — toggle visibility (admin only)
- admin_mark_message_read_nick(nick, id, read) — mark message (admin only)
- admin_delete_message_nick(nick, id) — delete message (admin only)

## Security
- nicks: anon can SELECT and INSERT only. No direct UPDATE/DELETE.
- subjects: anon can SELECT active. Admin ops via RPC only.
- messages: anon can INSERT. Admin read/delete via RPC only.
- settings: no direct access. Admin read/write via RPC only.
*/

-- ============================================================
-- TABLE: nicks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.nicks (
  nick text PRIMARY KEY,
  full_name text,
  is_admin boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  last_login_at timestamptz
);

ALTER TABLE public.nicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "nicks_select_any" ON public.nicks;
CREATE POLICY "nicks_select_any" ON public.nicks FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "nicks_insert_any" ON public.nicks;
CREATE POLICY "nicks_insert_any" ON public.nicks FOR INSERT
  TO anon, authenticated WITH CHECK (true);

-- ============================================================
-- FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin_nick(p_nick text)
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT is_admin FROM public.nicks WHERE nick = p_nick), false);
$$;

CREATE OR REPLACE FUNCTION public.update_last_login_nick(p_nick text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.nicks SET last_login_at = now() WHERE nick = p_nick;
$$;

CREATE OR REPLACE FUNCTION public.claim_first_admin_nick(p_nick text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE admin_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.nicks WHERE is_admin = true) INTO admin_exists;
  IF admin_exists THEN RETURN false; END IF;
  UPDATE public.nicks SET is_admin = true WHERE nick = p_nick;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_set_admin_nick(p_caller text, p_target text, p_val boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_nick(p_caller) THEN RAISE EXCEPTION 'Not admin'; END IF;
  UPDATE public.nicks SET is_admin = p_val WHERE nick = p_target;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_messages_nick(p_nick text)
RETURNS SETOF public.messages LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT m.* FROM public.messages m WHERE public.is_admin_nick(p_nick) ORDER BY m.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_profiles_nick(p_nick text)
RETURNS SETOF public.nicks LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT n.* FROM public.nicks n WHERE public.is_admin_nick(p_nick) ORDER BY n.created_at ASC;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_setting_nick(p_nick text, p_key text)
RETURNS text LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT s.value FROM public.settings s WHERE s.key = p_key AND public.is_admin_nick(p_nick);
$$;

CREATE OR REPLACE FUNCTION public.admin_set_setting_nick(p_nick text, p_key text, p_value text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_nick(p_nick) THEN RAISE EXCEPTION 'Not admin'; END IF;
  INSERT INTO public.settings (key, value, updated_at) VALUES (p_key, p_value, now())
  ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();
  RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_add_subject_nick(
  p_nick text, p_name text, p_slug text, p_desc text, p_url text, p_icon text, p_sort int
)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
  IF NOT public.is_admin_nick(p_nick) THEN RAISE EXCEPTION 'Not admin'; END IF;
  INSERT INTO public.subjects (name, slug, description, url, icon, sort_order)
  VALUES (p_name, COALESCE(NULLIF(p_slug, ''), lower(replace(p_name, ' ', '-'))), NULLIF(p_desc, ''), p_url, p_icon, COALESCE(p_sort, 0))
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_subject_nick(
  p_nick text, p_id uuid, p_name text, p_slug text, p_desc text, p_url text, p_icon text, p_sort int, p_active boolean
)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_nick(p_nick) THEN RAISE EXCEPTION 'Not admin'; END IF;
  UPDATE public.subjects SET name=p_name, slug=p_slug, description=NULLIF(p_desc,''), url=p_url, icon=p_icon, sort_order=p_sort, is_active=p_active
  WHERE id = p_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_subject_nick(p_nick text, p_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_nick(p_nick) THEN RAISE EXCEPTION 'Not admin'; END IF;
  DELETE FROM public.subjects WHERE id = p_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_toggle_subject_active_nick(p_nick text, p_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE cur boolean;
BEGIN
  IF NOT public.is_admin_nick(p_nick) THEN RAISE EXCEPTION 'Not admin'; END IF;
  SELECT is_active INTO cur FROM public.subjects WHERE id = p_id;
  UPDATE public.subjects SET is_active = NOT cur WHERE id = p_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_mark_message_read_nick(p_nick text, p_id uuid, p_read boolean)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_nick(p_nick) THEN RAISE EXCEPTION 'Not admin'; END IF;
  UPDATE public.messages SET is_read = p_read WHERE id = p_id;
  RETURN FOUND;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_message_nick(p_nick text, p_id uuid)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_nick(p_nick) THEN RAISE EXCEPTION 'Not admin'; END IF;
  DELETE FROM public.messages WHERE id = p_id;
  RETURN FOUND;
END;
$$;

-- Drop old claim_first_admin that used auth.uid()
DROP FUNCTION IF EXISTS public.claim_first_admin();

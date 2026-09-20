CREATE OR REPLACE FUNCTION public.admin_set_full_name_nick(p_nick text, p_full_name text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin_nick(p_nick) THEN RAISE EXCEPTION 'Not admin'; END IF;
  UPDATE public.nicks SET full_name = NULLIF(p_full_name, '') WHERE nick = p_nick;
  RETURN FOUND;
END;
$$;

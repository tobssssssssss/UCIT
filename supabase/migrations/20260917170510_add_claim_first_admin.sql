/*
# Add claim_first_admin function

## Overview
A SECURITY DEFINER function that allows the first user to claim admin when no admin exists.
This is needed because the is_admin trigger blocks non-admins from promoting themselves,
but someone needs to be the first admin.

## New Functions
- `claim_first_admin()`: If no admin exists in profiles, sets the calling user's is_admin to true.
  Returns true if claimed, false if an admin already exists.

## Security
- SECURITY DEFINER so it can bypass the protect_is_admin trigger's check.
- Checks that no admin exists before granting admin to the caller.
*/

CREATE OR REPLACE FUNCTION public.claim_first_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_exists boolean;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE is_admin = true) INTO admin_exists;
  IF admin_exists THEN
    RETURN false;
  END IF;
  UPDATE public.profiles SET is_admin = true WHERE id = auth.uid();
  RETURN FOUND;
END;
$$;

-- Allow any authenticated user to call it (the function itself checks if no admin exists)
DROP POLICY IF EXISTS "profiles_update_for_claim" ON public.profiles;
-- We need a separate policy to allow the claim function to work
-- Actually the function is SECURITY DEFINER so it bypasses RLS
-- No additional policy needed


-- Defense in depth: explicit policies disallowing non-admin writes to user_roles
DROP POLICY IF EXISTS "Admins manage all roles" ON public.user_roles;

CREATE POLICY "Admins can select all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can insert roles" ON public.user_roles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles" ON public.user_roles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Restrict EXECUTE on SECURITY DEFINER has_role to roles that need it.
-- RLS policies invoke has_role; it must remain callable by authenticated.
-- Revoke from PUBLIC/anon to reduce exposed surface.
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon;

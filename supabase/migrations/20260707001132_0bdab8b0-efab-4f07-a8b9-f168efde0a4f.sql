CREATE OR REPLACE FUNCTION public.grant_admin_to_emerson()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF lower(NEW.email) = 'emerstore385@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_grant_emerson ON auth.users;
CREATE TRIGGER on_auth_user_created_grant_emerson
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.grant_admin_to_emerson();

DROP TRIGGER IF EXISTS on_auth_user_confirmed_grant_emerson ON auth.users;
CREATE TRIGGER on_auth_user_confirmed_grant_emerson
AFTER UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
EXECUTE FUNCTION public.grant_admin_to_emerson();
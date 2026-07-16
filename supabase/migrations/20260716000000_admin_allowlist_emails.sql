-- Contas definitivas Admin (rode no SQL Editor do Supabase se quiser gravar em user_roles)
-- Acesso no app já funciona só pelo e-mail (allowlist), mesmo sem esta migration.

INSERT INTO public.user_roles (user_id, role)
SELECT p.id, 'admin'::public.app_role
FROM public.profiles p
WHERE lower(p.email) IN (
  'emerstore385@gmail.com',      -- Emerson — dono
  'luisferbedim123@gmail.com'    -- Luis Fernando Bedim — gestor 10%
)
ON CONFLICT (user_id, role) DO NOTHING;

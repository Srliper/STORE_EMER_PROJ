/**
 * Tipos de autenticação — sessão via Supabase Auth.
 */
export type AuthUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function mapSupabaseUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  identities?: Array<{ identity_data?: Record<string, unknown> | null }> | null;
}): AuthUser {
  const meta = user.user_metadata ?? {};
  const identityEmail = user.identities
    ?.map((i) => i.identity_data?.email)
    .find((e) => typeof e === "string");

  const email =
    user.email ||
    (typeof meta.email === "string" ? meta.email : null) ||
    (typeof identityEmail === "string" ? identityEmail : null) ||
    null;

  return {
    id: user.id,
    email,
    name:
      (meta.full_name as string | undefined) ??
      (meta.name as string | undefined) ??
      (meta.nome as string | undefined) ??
      null,
    image:
      (meta.avatar_url as string | undefined) ??
      (meta.picture as string | undefined) ??
      null,
  };
}

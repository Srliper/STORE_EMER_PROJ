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
}): AuthUser {
  const meta = user.user_metadata ?? {};
  return {
    id: user.id,
    email: user.email ?? null,
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

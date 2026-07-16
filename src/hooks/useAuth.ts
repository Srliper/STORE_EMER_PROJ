import { useCallback, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useAuthContext } from "@/providers/AuthProvider";

type AuthProviderName = "google";

type UseAuthReturn = {
  user: ReturnType<typeof useAuthContext>["user"];
  session: Session | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
  signIn: (provider: AuthProviderName, callbackUrl?: string) => Promise<void>;
  signOut: (callbackUrl?: string) => Promise<void>;
  getSession: () => Promise<Session | null>;
  refreshSession: () => Promise<void>;
};

/**
 * Login Google via Supabase Auth (OAuth nativo).
 * Sem Lovable Auth e sem Auth.js.
 */
export function useAuth(): UseAuthReturn {
  const { session, user, isReady, refreshSession } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSession = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session;
  }, []);

  const signIn = useCallback(async (_provider: AuthProviderName, callbackUrl?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const next = callbackUrl?.startsWith("/") ? callbackUrl : "/";
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;

      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (oauthError) {
        setError(oauthError.message);
        throw oauthError;
      }
      // Browser redireciona para o Google
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Falha ao iniciar login com Google.";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(
    async (callbackUrl?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await supabase.auth.signOut();
        await refreshSession();
        window.location.href = callbackUrl ?? "/";
      } catch (err) {
        const message = err instanceof Error ? err.message : "Falha ao encerrar sessão.";
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [refreshSession],
  );

  return {
    user,
    session,
    isLoading,
    isReady,
    error,
    signIn,
    signOut,
    getSession,
    refreshSession,
  };
}

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import type { Session } from "@supabase/supabase-js";
import type { AuthUser } from "@/integrations/auth";
import { mapSupabaseUser } from "@/integrations/auth";
import { supabase } from "@/integrations/supabase/client";

type AuthContextValue = {
  session: Session | null;
  user: AuthUser | null;
  isReady: boolean;
  refreshSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
};

/**
 * Sessão global via Supabase Auth (Google OAuth nativo).
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;

    // Após redirect do Google, o Supabase troca ?code= pela sessão (PKCE)
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setIsReady(true);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) setSession(next);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshSession = async () => {
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    await router.invalidate();
  };

  const user = session?.user ? mapSupabaseUser(session.user) : null;

  return (
    <AuthContext.Provider value={{ session, user, isReady, refreshSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext deve ser usado dentro de <AuthProvider>.");
  }
  return context;
}

import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({
  next: z.string().optional(),
  callbackUrl: z.string().optional(),
  code: z.string().optional(),
  error: z.string().optional(),
  error_description: z.string().optional(),
});

/**
 * Retorno do Google OAuth (Supabase PKCE).
 * Troca ?code= pela sessão e só então redireciona.
 */
export const Route = createFileRoute("/auth/callback")({
  ssr: false,
  validateSearch: searchSchema,
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [message, setMessage] = useState("Finalizando login…");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (search.error) {
        setMessage(search.error_description ?? search.error);
        return;
      }

      // PKCE: troca o code da URL pela sessão
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code") ?? search.code;

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          console.error("[auth/callback]", error);
          if (!cancelled) {
            setMessage(error.message);
            setTimeout(() => {
              navigate({ to: "/auth", search: { error: "OAuthCallback" }, replace: true });
            }, 1500);
          }
          return;
        }
      } else {
        // Fallback: tenta ler sessão já detectada
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          if (!cancelled) {
            setMessage("Sessão não encontrada. Tente entrar de novo.");
            setTimeout(() => navigate({ to: "/auth", replace: true }), 1500);
          }
          return;
        }
      }

      const next =
        (search.next?.startsWith("/") && search.next) ||
        (search.callbackUrl?.startsWith("/") && search.callbackUrl) ||
        "/";

      if (!cancelled) {
        navigate({ to: next, replace: true });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <p className="text-sm opacity-80">{message}</p>
    </div>
  );
}

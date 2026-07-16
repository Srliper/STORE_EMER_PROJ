import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { LoginButton } from "@/components/LoginButton";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { z } from "zod";

const authSearchSchema = z.object({
  callbackUrl: z.string().optional(),
  error: z.string().optional(),
});

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: authSearchSchema,
  beforeLoad: async ({ search }) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const dest = search.callbackUrl?.startsWith("/") ? search.callbackUrl : "/";
        throw redirect({ to: dest });
      }
    } catch (error) {
      if (error && typeof error === "object" && "to" in error) throw error;
      console.error("[auth] Erro ao verificar sessão:", error);
    }
  },
  head: () => ({
    meta: [
      { title: "Entrar — Emerson Store" },
      { name: "description", content: "Acesse sua conta na Emerson Store." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { callbackUrl, error: authError } = Route.useSearch();
  const { user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);

  const destination = callbackUrl ?? "/";

  useEffect(() => {
    if (user) {
      navigate({ to: destination, replace: true });
    }
  }, [user, navigate, destination]);

  // Se voltou do Google com ?code= e ainda não há user, aguarda a sessão
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("code") && !window.location.hash.includes("access_token")) return;

    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!cancelled && data.session) {
        navigate({ to: destination, replace: true });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [destination, navigate]);

  useEffect(() => {
    if (authError) {
      toast.error(
        authError === "AccessDenied"
          ? "Acesso negado. Você cancelou o login ou não tem permissão."
          : "Erro na autenticação Google. Ative Google no Supabase → Authentication → Providers.",
      );
    }
  }, [authError]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { nome },
          },
        });
        if (error) throw error;
        toast.success("Conta criada! Verifique seu email para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Bem-vindo de volta!");
        navigate({ to: destination, replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
          <Link to="/" className="text-2xl font-display font-bold tracking-tighter text-brand">
            EMERSON STORE
          </Link>
        </div>
      </div>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-display font-bold mb-2">
            {mode === "login" ? "Entrar" : "Criar conta"}
          </h1>
          <p className="text-sm opacity-70 mb-8">
            {mode === "login"
              ? "Acesse sua conta para finalizar pedidos."
              : "Cadastre-se para comprar e acompanhar pedidos."}
          </p>

          <LoginButton callbackUrl={destination} />

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs opacity-50 uppercase tracking-wider">ou email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleEmail} className="space-y-4">
            {mode === "signup" && (
              <div>
                <label className="text-xs font-bold uppercase tracking-tight mb-2 block">Nome</label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full bg-white/5 border-2 border-white/10 focus:border-brand rounded-xl px-4 py-3 outline-none transition-colors"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-bold uppercase tracking-tight mb-2 block">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-white/5 border-2 border-white/10 focus:border-brand rounded-xl px-4 py-3 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-tight mb-2 block">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-white/5 border-2 border-white/10 focus:border-brand rounded-xl px-4 py-3 outline-none transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand text-primary-foreground rounded-full py-3.5 font-bold uppercase tracking-tight hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>

          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="w-full mt-6 text-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
          </button>
        </div>
      </main>
    </div>
  );
}

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type LoginButtonProps = {
  callbackUrl?: string;
  className?: string;
  label?: string;
  /** Exibe avatar, nome e botão de sair quando autenticado */
  showLoggedInState?: boolean;
};

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

/**
 * Botão de login com Google via Supabase Auth.
 * Quando logado, exibe nome do usuário e botão de sair (se showLoggedInState=true).
 */
export function LoginButton({
  callbackUrl,
  className = "",
  label = "Entrar com Google",
  showLoggedInState = true,
}: LoginButtonProps) {
  const { user, signIn, signOut, isLoading, error } = useAuth();
  const [localLoading, setLocalLoading] = useState(false);

  const loading = isLoading || localLoading;

  const handleSignIn = async () => {
    setLocalLoading(true);
    try {
      await signIn("google", callbackUrl);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Não foi possível iniciar o login com Google.",
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLocalLoading(true);
    try {
      await signOut(callbackUrl ?? "/");
      toast.success("Sessão encerrada com sucesso.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro ao sair da conta.");
    } finally {
      setLocalLoading(false);
    }
  };

  // Estado autenticado: mostra nome e botão de sair
  if (showLoggedInState && user) {
    return (
      <div className={`w-full ${className}`}>
        <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name ?? "Usuário"}
              className="size-10 rounded-full border-2 border-brand/40"
            />
          ) : (
            <div className="size-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold">
              {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{user.name ?? "Usuário"}</p>
            {user.email && <p className="text-xs opacity-60 truncate">{user.email}</p>}
          </div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          disabled={loading}
          className="mt-3 w-full border-2 border-white/20 hover:border-red-400/50 hover:bg-red-500/10 rounded-full py-3 font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saindo...
            </>
          ) : (
            <>
              <LogOut className="size-4" />
              Sair
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleSignIn}
        disabled={loading}
        className={`w-full border-2 border-white/20 hover:border-white/40 hover:bg-white/5 rounded-full py-3.5 font-semibold flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Conectando...
          </>
        ) : (
          <>
            <GoogleIcon />
            {label}
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-sm text-red-400 text-center" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

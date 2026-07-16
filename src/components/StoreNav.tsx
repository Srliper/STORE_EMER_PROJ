import { Link } from "@tanstack/react-router";
import { User, Shield } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { CartButton } from "./CartButton";
import { useAuth } from "@/hooks/useAuth";
import { isAdminEmail } from "@/lib/admin-access";
import { checkIsAdmin } from "@/lib/admin.functions";
import logo from "@/assets/logo.png";

export function StoreNav() {
  const { user, isReady } = useAuth();
  const signedIn = !!user;
  const checkAdmin = useServerFn(checkIsAdmin);

  // Fallback: e-mail no cliente + confirmação no servidor (claims JWT)
  const emailLooksAdmin = isAdminEmail(user?.email);
  const { data: adminData } = useQuery({
    queryKey: ["nav-is-admin", user?.id],
    queryFn: () => checkAdmin(),
    enabled: signedIn && isReady,
    staleTime: 60_000,
    retry: 1,
  });

  const showAdmin = emailLooksAdmin || !!adminData?.isAdmin;

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center" aria-label="Emerson Store">
          <img src={logo} alt="Emerson Store" width={160} height={160} className="h-14 w-auto" />
        </Link>
        <div className="hidden md:flex gap-8 text-sm font-medium uppercase tracking-widest">
          <a href="/#vapes" className="hover:text-brand transition-colors">
            Vapes
          </a>
          <a href="/#shirts" className="hover:text-brand transition-colors">
            Estamparia
          </a>
          <a href="/#perfumes" className="hover:text-brand transition-colors">
            Perfumes
          </a>
        </div>
        <div className="flex items-center gap-3">
          {showAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-2 bg-brand/10 hover:bg-brand/20 border border-brand/40 text-brand px-3 sm:px-4 py-2 rounded-full text-xs font-bold uppercase tracking-tight transition-colors"
            >
              <Shield className="size-4" />
              <span className="hidden xs:inline sm:inline">Admin</span>
            </Link>
          )}
          {signedIn ? (
            <Link
              to="/minha-conta"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-tight transition-colors"
            >
              <User className="size-4" />{" "}
              <span className="hidden sm:inline">{user?.name ?? user?.email ?? "Minha conta"}</span>
            </Link>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-tight transition-colors"
            >
              <User className="size-4" /> <span className="hidden sm:inline">Entrar</span>
            </Link>
          )}
          <CartButton />
          <div className="hidden sm:flex bg-brand text-primary-foreground px-4 py-2 rounded-full text-xs font-bold uppercase tracking-tighter items-center gap-2">
            <span className="size-1.5 bg-primary-foreground rounded-full animate-pulse" />
            Delivery On
          </div>
        </div>
      </div>
    </nav>
  );
}

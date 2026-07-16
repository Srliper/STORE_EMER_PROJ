import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { checkIsAdmin } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { LayoutDashboard, ShoppingBag, Package, Users, UserCog, LogOut, Store, Percent } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Emerson Store" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { signOut } = useAuth();
  const fn = useServerFn(checkIsAdmin);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data, isLoading } = useQuery({
    queryKey: ["is-admin"],
    queryFn: () => fn(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="opacity-60">Carregando...</p>
      </div>
    );
  }

  if (!data?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-6">
        <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
          <h1 className="text-2xl font-display font-bold mb-3">Área Administrativa</h1>
          <p className="text-sm opacity-70 mb-6">
            Entre com a conta Google do <strong>dono</strong> (Emerson — emerstore385@gmail.com)
            ou do <strong>gestor</strong> (Luis Fernando Bedim — luisferbedim123@gmail.com). O
            acesso ao Admin aparece automaticamente após o login.
          </p>
          <Link
            to="/auth"
            search={{ callbackUrl: "/admin" }}
            className="inline-flex bg-brand text-primary-foreground px-6 py-3 rounded-full font-bold uppercase tracking-tight text-sm w-full mb-3 justify-center hover:scale-[1.02] transition-transform"
          >
            Entrar com Google
          </Link>
          <Link
            to="/"
            className="block text-xs uppercase tracking-tight opacity-60 hover:opacity-100"
          >
            ← Voltar para a loja
          </Link>
        </div>
      </div>
    );
  }

  const links = [
    { to: "/admin", icon: LayoutDashboard, label: "Dashboard", exact: true },
    { to: "/admin/pedidos", icon: ShoppingBag, label: "Pedidos" },
    { to: "/admin/comissao", icon: Percent, label: "Comissão" },
    { to: "/admin/produtos", icon: Package, label: "Produtos" },
    { to: "/admin/clientes", icon: Users, label: "Clientes" },
    { to: "/admin/equipe", icon: UserCog, label: "Equipe" },
  ];

  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");

  const logout = async () => {
    try {
      await signOut("/");
    } catch {
      toast.error("Erro ao sair da conta.");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <aside className="w-60 shrink-0 border-r border-white/10 bg-black/40 p-5 flex flex-col gap-1 sticky top-0 h-screen">
        <Link to="/" className="text-xl font-display font-bold text-brand mb-8 block">
          EMERSON · ADMIN
        </Link>
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(l.to, l.exact)
                ? "bg-brand text-primary-foreground"
                : "hover:bg-white/5 opacity-80"
            }`}
          >
            <l.icon className="size-4" /> {l.label}
          </Link>
        ))}
        <div className="mt-auto flex flex-col gap-1">
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 opacity-70"
          >
            <Store className="size-4" /> Ver a loja
          </Link>
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-white/5 opacity-70 text-left"
          >
            <LogOut className="size-4" /> Sair
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

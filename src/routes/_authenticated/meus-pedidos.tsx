import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { StoreNav } from "@/components/StoreNav";

export const Route = createFileRoute("/_authenticated/meus-pedidos")({
  head: () => ({ meta: [{ title: "Meus Pedidos — Emerson Store" }] }),
  component: MeusPedidosPage,
});

type PedidoItem = { name?: string; qty?: number; price?: number };
type Pedido = {
  id: string;
  created_at: string;
  status: string;
  total: number;
  frete: number;
  produtos: PedidoItem[] | unknown;
  codigo_rastreio: string | null;
};

const statusLabel: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

function MeusPedidosPage() {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }

      // Busca perfil pelo email do Google OAuth e depois os pedidos
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", user.email)
        .maybeSingle();

      if (!profile?.id) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("pedidos")
        .select("id,created_at,status,total,frete,produtos,codigo_rastreio")
        .eq("cliente_id", profile.id)
        .order("created_at", { ascending: false });

      if (data) setPedidos(data as Pedido[]);
      setLoading(false);
    })();
  }, [user]);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <StoreNav />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-display font-bold">Meus Pedidos</h1>
          <Link
            to="/minha-conta"
            className="text-sm font-bold uppercase tracking-tight text-brand hover:underline"
          >
            ← Minha conta
          </Link>
        </div>

        {loading ? (
          <p className="opacity-60">Carregando...</p>
        ) : pedidos.length === 0 ? (
          <div className="border border-white/10 rounded-2xl p-10 text-center">
            <p className="opacity-70 mb-6">Você ainda não fez nenhum pedido.</p>
            <Link
              to="/"
              className="inline-block bg-brand text-primary-foreground px-6 py-3 rounded-full font-bold uppercase tracking-tight text-sm"
            >
              Ir às compras
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {pedidos.map((p) => {
              const itens = Array.isArray(p.produtos) ? (p.produtos as PedidoItem[]) : [];
              return (
                <div key={p.id} className="border border-white/10 rounded-2xl p-5 bg-white/5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs opacity-60 font-mono">
                      #{p.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-xs bg-brand/20 text-brand px-3 py-1 rounded-full font-bold uppercase tracking-tight">
                      {statusLabel[p.status] ?? p.status}
                    </span>
                  </div>
                  <p className="text-xs opacity-60 mb-3">
                    {new Date(p.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <ul className="text-sm space-y-1 mb-3">
                    {itens.map((it, i) => (
                      <li key={i} className="opacity-80">
                        {it.qty}× {it.name}
                      </li>
                    ))}
                  </ul>
                  <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <span className="text-xs opacity-60">
                      Frete: {Number(p.frete) > 0 ? `R$ ${p.frete.toFixed(2)}` : "GRÁTIS"}
                    </span>
                    <span className="font-bold text-lg">R$ {p.total.toFixed(2)}</span>
                  </div>
                  {p.codigo_rastreio && (
                    <p className="text-xs mt-3 opacity-70">
                      Rastreio: <span className="font-mono">{p.codigo_rastreio}</span>
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

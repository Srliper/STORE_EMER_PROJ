import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { adminStats } from "@/lib/admin.functions";
import { DollarSign, ShoppingBag, Users, Package, Clock, Percent } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function AdminDashboard() {
  const fn = useServerFn(adminStats);
  const { data, isLoading } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fn() });

  if (isLoading || !data) return <p className="opacity-60">Carregando...</p>;

  const max = Math.max(1, ...data.ultimos7.map((d) => d.total));
  const pct = Math.round((data.commissionRate ?? 0) * 100);
  const shareLabel =
    data.role === "owner"
      ? `Sua parte (${pct}%)`
      : `Minha comissão (${pct}%)`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Dashboard</h1>
        <p className="opacity-60 text-sm">Visão geral da Emerson Store</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat icon={DollarSign} label="Faturamento" value={brl(data.faturamento)} />
        <Stat icon={Percent} label={shareLabel} value={brl(data.comissao ?? 0)} accent />
        <Stat icon={ShoppingBag} label="Vendas hoje" value={String(data.vendasHoje)} />
        <Stat icon={Clock} label="Pedidos pendentes" value={String(data.totalPendentes)} />
        <Stat icon={Users} label="Clientes" value={String(data.totalClientes)} />
        <Stat icon={Package} label="Produtos" value={String(data.totalProdutos)} />
        <Stat icon={ShoppingBag} label="Total de pedidos" value={String(data.totalPedidos)} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="font-bold mb-6">Faturamento dos últimos 7 dias</h2>
        <div className="flex items-end gap-3 h-48">
          {data.ultimos7.map((d) => (
            <div key={d.dia} className="flex-1 flex flex-col items-center gap-2">
              <div className="text-xs opacity-60">{brl(d.total)}</div>
              <div
                className="w-full bg-brand rounded-t-md transition-all"
                style={{ height: `${(d.total / max) * 100}%`, minHeight: "4px" }}
              />
              <div className="text-xs opacity-70">{d.dia}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        accent ? "bg-brand/10 border-brand/40" : "bg-white/5 border-white/10"
      }`}
    >
      <Icon className={`size-5 mb-3 ${accent ? "text-brand" : "opacity-60"}`} />
      <div className="text-xs uppercase tracking-tight opacity-70">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

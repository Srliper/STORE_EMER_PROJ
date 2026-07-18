import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { comissaoPorProduto } from "@/lib/admin.functions";
import { Percent, DollarSign, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/comissao")({
  component: ComissaoPage,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ComissaoPage() {
  const fn = useServerFn(comissaoPorProduto);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-comissao"],
    queryFn: () => fn(),
  });

  if (isLoading || !data) return <p className="opacity-60">Carregando...</p>;

  const pct = Math.round((data.commissionRate ?? 0) * 100);
  const isOwner = data.role === "owner";
  const title = isOwner ? "Sua parte (dono)" : "Minha comissão";
  const subtitle = isOwner
    ? "90% da receita das vendas (pedidos pagos, enviados ou entregues). O gestor recebe 10%."
    : "10% sobre cada produto vendido (pedidos pagos, enviados ou entregues)";
  const shareLabel = isOwner ? `Sua parte (${pct}%)` : `Comissão total (${pct}%)`;
  const colLabel = isOwner ? `Sua parte (${pct}%)` : `Comissão (${pct}%)`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">{title}</h1>
        <p className="opacity-60 text-sm">{subtitle}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card icon={DollarSign} label="Receita total" value={brl(data.receitaTotal)} />
        <Card icon={Percent} label={shareLabel} value={brl(data.comissaoTotal)} accent />
        <Card icon={ShoppingBag} label="Pedidos pagos" value={String(data.pedidosPagos)} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="font-bold">{isOwner ? "Parte por produto" : "Comissão por produto"}</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="p-4 font-medium">Produto</th>
              <th className="p-4 font-medium text-right">Qtd vendida</th>
              <th className="p-4 font-medium text-right">Receita</th>
              <th className="p-4 font-medium text-right">{colLabel}</th>
            </tr>
          </thead>
          <tbody>
            {data.linhas.map((l) => (
              <tr key={l.nome} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-4">{l.nome}</td>
                <td className="p-4 text-right">{l.qtd}</td>
                <td className="p-4 text-right">{brl(l.receita)}</td>
                <td className="p-4 text-right font-bold text-brand">{brl(l.comissao)}</td>
              </tr>
            ))}
            {data.linhas.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center opacity-60">
                  Nenhuma venda registrada ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Card({
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

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { comissaoPorProduto } from "@/lib/admin.functions";
import { Percent, DollarSign, ShoppingBag, Crown, Briefcase } from "lucide-react";

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

  const isOwner = data.role === "owner";
  const pct = Math.round((data.commissionRate ?? 0) * 100);
  const myLabel = isOwner ? `Sua parte — Emerson (${pct}%)` : `Sua comissão — gestor (${pct}%)`;
  const myValue = brl(data.comissaoTotal);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Participação nas vendas</h1>
        <p className="opacity-60 text-sm">
          Emerson (dono) fica com 90% da receita. O gestor recebe 10% de comissão. Frete é grátis.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`rounded-2xl border p-5 ${isOwner ? "bg-brand/10 border-brand/40" : "bg-white/5 border-white/10"}`}>
          <Crown className={`size-5 mb-3 ${isOwner ? "text-brand" : "opacity-60"}`} />
          <div className="text-xs uppercase tracking-tight opacity-70">Emerson — dono</div>
          <div className="text-2xl font-bold mt-1">{brl(data.ownerShare ?? data.receitaTotal * 0.9)}</div>
          <div className="text-sm opacity-70 mt-1">90% da receita</div>
        </div>
        <div className={`rounded-2xl border p-5 ${!isOwner ? "bg-brand/10 border-brand/40" : "bg-white/5 border-white/10"}`}>
          <Briefcase className={`size-5 mb-3 ${!isOwner ? "text-brand" : "opacity-60"}`} />
          <div className="text-xs uppercase tracking-tight opacity-70">Gestor — comissão</div>
          <div className="text-2xl font-bold mt-1">{brl(data.gestorShare ?? data.receitaTotal * 0.1)}</div>
          <div className="text-sm opacity-70 mt-1">10% da receita</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card icon={DollarSign} label="Receita total" value={brl(data.receitaTotal)} />
        <Card icon={Percent} label={myLabel} value={myValue} accent />
        <Card icon={ShoppingBag} label="Pedidos pagos" value={String(data.pedidosPagos)} />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="font-bold">Detalhe por produto (sua parte {pct}%)</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="p-4 font-medium">Produto</th>
              <th className="p-4 font-medium text-right">Qtd</th>
              <th className="p-4 font-medium text-right">Receita</th>
              <th className="p-4 font-medium text-right">Sua parte ({pct}%)</th>
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

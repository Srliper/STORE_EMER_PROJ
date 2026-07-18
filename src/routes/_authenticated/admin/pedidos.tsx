import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Fragment } from "react";
import { useState } from "react";
import { listarPedidosAdmin, atualizarPedido } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/pedidos")({
  component: PedidosAdmin,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STATUS = ["pendente", "pago", "enviado", "entregue", "cancelado"] as const;

const statusColor: Record<string, string> = {
  pendente: "bg-amber-500/20 text-amber-300",
  pago: "bg-blue-500/20 text-blue-300",
  enviado: "bg-purple-500/20 text-purple-300",
  entregue: "bg-green-500/20 text-green-300",
  cancelado: "bg-red-500/20 text-red-300",
};

function PedidosAdmin() {
  const qc = useQueryClient();
  const listar = useServerFn(listarPedidosAdmin);
  const atualizar = useServerFn(atualizarPedido);
  const [filtro, setFiltro] = useState<string>("todos");
  const [aberto, setAberto] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-pedidos"],
    queryFn: () => listar(),
  });

  const mut = useMutation({
    mutationFn: (vars: { id: string; status?: string; codigo_rastreio?: string }) =>
      atualizar({ data: vars }),
    onSuccess: () => {
      toast.success("Pedido atualizado");
      qc.invalidateQueries({ queryKey: ["admin-pedidos"] });
      qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  if (isLoading || !data) return <p className="opacity-60">Carregando...</p>;

  const pedidos = data.pedidos.filter((p: any) => filtro === "todos" || p.status === filtro);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Pedidos</h1>
          <p className="opacity-60 text-sm">{pedidos.length} pedido(s)</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <FiltroBtn label="Todos" active={filtro === "todos"} onClick={() => setFiltro("todos")} />
          {STATUS.map((s) => (
            <FiltroBtn key={s} label={s} active={filtro === s} onClick={() => setFiltro(s)} />
          ))}
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5">
            <tr className="text-left">
              <th className="p-4 font-medium">Pedido</th>
              <th className="p-4 font-medium">Data</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Rastreio</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p: any) => (
              <Fragment key={p.id}>
                <tr className="border-t border-white/5 hover:bg-white/5">
                  <td className="p-4 font-mono text-xs">{p.id.slice(0, 8)}</td>
                  <td className="p-4">{new Date(p.created_at).toLocaleString("pt-BR")}</td>
                  <td className="p-4 font-bold">{brl(Number(p.total))}</td>
                  <td className="p-4">
                    <select
                      value={p.status}
                      onChange={(e) => mut.mutate({ id: p.id, status: e.target.value })}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-tight border-0 ${statusColor[p.status]}`}
                    >
                      {STATUS.map((s) => (
                        <option key={s} value={s} className="bg-background text-foreground">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <input
                      defaultValue={p.codigo_rastreio ?? ""}
                      placeholder="código..."
                      onBlur={(e) => {
                        if (e.target.value !== (p.codigo_rastreio ?? "")) {
                          mut.mutate({ id: p.id, codigo_rastreio: e.target.value });
                        }
                      }}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs w-32"
                    />
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setAberto(aberto === p.id ? null : p.id)}
                      className="text-xs uppercase tracking-tight opacity-70 hover:opacity-100"
                    >
                      {aberto === p.id ? "Fechar" : "Detalhes"}
                    </button>
                  </td>
                </tr>
                {aberto === p.id && (
                  <tr className="bg-black/20">
                    <td colSpan={6} className="p-6">
                      <div className="grid md:grid-cols-2 gap-6 text-xs">
                        <div>
                          <h4 className="font-bold mb-2 uppercase tracking-tight">Itens</h4>
                          <pre className="bg-black/30 p-3 rounded overflow-auto max-h-60">
                            {JSON.stringify(p.produtos, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <h4 className="font-bold mb-2 uppercase tracking-tight">Endereço</h4>
                          <pre className="bg-black/30 p-3 rounded overflow-auto max-h-60">
                            {JSON.stringify(p.endereco_entrega, null, 2)}
                          </pre>
                          <div className="mt-3 space-y-1 opacity-80">
                            <div>Subtotal: {brl(Number(p.subtotal))}</div>
                            <div>Frete: GRÁTIS</div>
                            <div>Desconto: {brl(Number(p.desconto))}</div>
                            <div>Pagamento: {p.metodo_pagamento ?? "—"}</div>
                            {p.observacoes && <div>Obs: {p.observacoes}</div>}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {pedidos.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center opacity-60">
                  Nenhum pedido encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FiltroBtn({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-tight transition-colors ${
        active ? "bg-brand text-primary-foreground" : "bg-white/5 hover:bg-white/10"
      }`}
    >
      {label}
    </button>
  );
}

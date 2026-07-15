import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listarClientesAdmin } from "@/lib/admin.functions";

export const Route = createFileRoute("/_authenticated/admin/clientes")({
  component: ClientesAdmin,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function ClientesAdmin() {
  const fn = useServerFn(listarClientesAdmin);
  const [busca, setBusca] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-clientes"],
    queryFn: () => fn(),
  });

  if (isLoading || !data) return <p className="opacity-60">Carregando...</p>;

  const filtrados = data.clientes.filter((c: any) => {
    const q = busca.toLowerCase();
    return (
      !q ||
      c.nome?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.telefone?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Clientes</h1>
          <p className="opacity-60 text-sm">{filtrados.length} cliente(s)</p>
        </div>
        <input
          placeholder="Buscar por nome, email, telefone..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="input w-80"
        />
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left">
            <tr>
              <th className="p-4 font-medium">Nome</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Telefone</th>
              <th className="p-4 font-medium">Pedidos</th>
              <th className="p-4 font-medium">Gasto total</th>
              <th className="p-4 font-medium">Cadastro</th>
            </tr>
          </thead>
          <tbody>
            {filtrados.map((c: any) => (
              <tr key={c.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-4 font-medium">{c.nome || "—"}</td>
                <td className="p-4 opacity-80">{c.email}</td>
                <td className="p-4 opacity-80">{c.telefone || "—"}</td>
                <td className="p-4">{c.pedidos}</td>
                <td className="p-4 font-bold">{brl(c.gasto)}</td>
                <td className="p-4 opacity-70">
                  {new Date(c.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
            {filtrados.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center opacity-60">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listarFuncionarios, promoverAdmin, revogarAdmin } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Trash2, Shield } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/equipe")({
  component: EquipeAdmin,
});

function EquipeAdmin() {
  const qc = useQueryClient();
  const listar = useServerFn(listarFuncionarios);
  const promover = useServerFn(promoverAdmin);
  const revogar = useServerFn(revogarAdmin);
  const [email, setEmail] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-equipe"],
    queryFn: () => listar(),
  });

  const promMut = useMutation({
    mutationFn: (e: string) => promover({ data: { email: e } }),
    onSuccess: () => {
      toast.success("Administrador adicionado");
      setEmail("");
      qc.invalidateQueries({ queryKey: ["admin-equipe"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const revMut = useMutation({
    mutationFn: (user_id: string) => revogar({ data: { user_id } }),
    onSuccess: () => {
      toast.success("Acesso revogado");
      qc.invalidateQueries({ queryKey: ["admin-equipe"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  if (isLoading || !data) return <p className="opacity-60">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-display font-bold">Equipe</h1>
        <p className="opacity-60 text-sm">Gerencie quem tem acesso ao painel administrativo</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <Shield className="size-4 text-brand" /> Adicionar administrador
        </h2>
        <p className="text-xs opacity-70 mb-4">
          A pessoa precisa estar cadastrada na loja antes de ser promovida.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            promMut.mutate(email);
          }}
          className="flex gap-3"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@exemplo.com"
            className="input flex-1"
          />
          <button
            type="submit"
            disabled={promMut.isPending}
            className="bg-brand text-primary-foreground px-6 py-2.5 rounded-full font-bold uppercase tracking-tight text-xs"
          >
            Promover
          </button>
        </form>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left">
            <tr>
              <th className="p-4 font-medium">Nome</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Desde</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {data.admins.map((a: any) => (
              <tr key={a.user_id} className="border-t border-white/5">
                <td className="p-4 font-medium">{a.nome || "—"}</td>
                <td className="p-4 opacity-80">{a.email}</td>
                <td className="p-4 opacity-70">
                  {new Date(a.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => {
                      if (confirm(`Revogar acesso admin de ${a.email}?`))
                        revMut.mutate(a.user_id);
                    }}
                    className="p-2 hover:bg-red-500/20 text-red-300 rounded"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

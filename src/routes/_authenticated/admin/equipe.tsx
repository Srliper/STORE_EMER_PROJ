import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listarFuncionarios, promoverAdmin, revogarAdmin } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Trash2, Shield, Crown, Briefcase } from "lucide-react";

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
        <p className="opacity-60 text-sm">
          Dono e gestor têm acesso automático ao logar. Emerson (dono): 90%. Gestor: 10% por produto.
        </p>
      </div>

      <div className="bg-white/5 border border-brand/30 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h2 className="font-bold flex items-center gap-2">
            <Crown className="size-4 text-brand" /> Contas definitivas
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left">
            <tr>
              <th className="p-4 font-medium">Nome</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Papel</th>
              <th className="p-4 font-medium">Participação</th>
            </tr>
          </thead>
          <tbody>
            {(data.permanentes ?? []).map((m: any) => (
              <tr key={m.email} className="border-t border-white/5">
                <td className="p-4 font-medium flex items-center gap-2">
                  {m.papel === "dono" ? (
                    <Crown className="size-4 text-brand" />
                  ) : (
                    <Briefcase className="size-4 text-brand" />
                  )}
                  {m.nome}
                </td>
                <td className="p-4 opacity-80">{m.email}</td>
                <td className="p-4 uppercase text-xs tracking-tight font-bold text-brand">
                  {m.papel}
                </td>
                <td className="p-4">
                  {Math.round((m.commissionRate ?? 0) * 100)}%
                  {m.papel === "dono" ? " (dono)" : " (comissão)"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
        <h2 className="font-bold mb-3 flex items-center gap-2">
          <Shield className="size-4 text-brand" /> Adicionar outro administrador
        </h2>
        <p className="text-xs opacity-70 mb-4">
          A pessoa precisa ter entrado na loja com Google pelo menos uma vez. Requer{" "}
          <code className="text-brand">SUPABASE_SERVICE_ROLE_KEY</code> na Vercel.
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

      {(data.admins?.length ?? 0) > 0 && (
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
                    {a.created_at
                      ? new Date(a.created_at).toLocaleDateString("pt-BR")
                      : "—"}
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
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { listarProdutosAdmin, upsertProduto, removerProduto, uploadImagemProduto } from "@/lib/admin.functions";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/produtos")({
  component: ProdutosAdmin,
});

const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

type ProdutoForm = {
  id?: string;
  nome: string;
  descricao: string;
  categoria: "vapes" | "estamparia" | "perfumes";
  preco: string;
  preco_promocional: string;
  estoque: string;
  ativo: boolean;
  destaque: boolean;
  imagem_url: string;
};

const emptyForm: ProdutoForm = {
  nome: "",
  descricao: "",
  categoria: "vapes",
  preco: "0",
  preco_promocional: "",
  estoque: "0",
  ativo: true,
  destaque: false,
  imagem_url: "",
};

function ProdutosAdmin() {
  const qc = useQueryClient();
  const listar = useServerFn(listarProdutosAdmin);
  const upsert = useServerFn(upsertProduto);
  const remover = useServerFn(removerProduto);
  const upload = useServerFn(uploadImagemProduto);

  const [form, setForm] = useState<ProdutoForm | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-produtos"],
    queryFn: () => listar(),
  });

  const mut = useMutation({
    mutationFn: (f: ProdutoForm) =>
      upsert({
        data: {
          id: f.id,
          nome: f.nome,
          descricao: f.descricao || null,
          categoria: f.categoria,
          preco: Number(f.preco),
          preco_promocional: f.preco_promocional ? Number(f.preco_promocional) : null,
          estoque: parseInt(f.estoque, 10) || 0,
          ativo: f.ativo,
          destaque: f.destaque,
          imagem_url: f.imagem_url || null,
        },
      }),
    onSuccess: () => {
      toast.success("Produto salvo");
      qc.invalidateQueries({ queryKey: ["admin-produtos"] });
      setForm(null);
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  const del = useMutation({
    mutationFn: (id: string) => remover({ data: { id } }),
    onSuccess: () => {
      toast.success("Produto removido");
      qc.invalidateQueries({ queryKey: ["admin-produtos"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Erro"),
  });

  if (isLoading || !data) return <p className="opacity-60">Carregando...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Produtos</h1>
          <p className="opacity-60 text-sm">{data.produtos.length} produto(s)</p>
        </div>
        <button
          onClick={() => setForm(emptyForm)}
          className="bg-brand text-primary-foreground px-5 py-2.5 rounded-full font-bold uppercase tracking-tight text-xs flex items-center gap-2 hover:scale-[1.02] transition-transform"
        >
          <Plus className="size-4" /> Novo produto
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left">
            <tr>
              <th className="p-4 font-medium">Nome</th>
              <th className="p-4 font-medium">Categoria</th>
              <th className="p-4 font-medium">Preço</th>
              <th className="p-4 font-medium">Estoque</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {data.produtos.map((p: any) => (
              <tr key={p.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-4 font-medium">{p.nome}</td>
                <td className="p-4 capitalize opacity-80">{p.categoria}</td>
                <td className="p-4 font-bold">{brl(Number(p.preco))}</td>
                <td className="p-4">{p.estoque}</td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      p.ativo ? "bg-green-500/20 text-green-300" : "bg-white/10 opacity-60"
                    }`}
                  >
                    {p.ativo ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="p-4 flex gap-2 justify-end">
                  <button
                    onClick={() =>
                      setForm({
                        id: p.id,
                        nome: p.nome,
                        descricao: p.descricao ?? "",
                        categoria: p.categoria,
                        preco: String(p.preco),
                        preco_promocional: p.preco_promocional ? String(p.preco_promocional) : "",
                        estoque: String(p.estoque),
                        ativo: p.ativo,
                        destaque: p.destaque,
                        imagem_url: p.imagem_url ?? "",
                      })
                    }
                    className="p-2 hover:bg-white/10 rounded"
                  >
                    <Pencil className="size-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Excluir "${p.nome}"?`)) del.mutate(p.id);
                    }}
                    className="p-2 hover:bg-red-500/20 text-red-300 rounded"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
            {data.produtos.length === 0 && (
              <tr>
                <td colSpan={6} className="p-12 text-center opacity-60">
                  Nenhum produto cadastrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {form && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-6"
          onClick={() => setForm(null)}
        >
          <div
            className="bg-background border border-white/10 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold mb-5">{form.id ? "Editar produto" : "Novo produto"}</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                mut.mutate(form);
              }}
              className="space-y-4"
            >
              <FormField label="Nome">
                <input
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="input"
                />
              </FormField>
              <FormField label="Descrição">
                <textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                  className="input h-20"
                />
              </FormField>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Categoria">
                  <select
                    value={form.categoria}
                    onChange={(e) =>
                      setForm({ ...form, categoria: e.target.value as ProdutoForm["categoria"] })
                    }
                    className="input"
                  >
                    <option value="vapes">Vapes</option>
                    <option value="estamparia">Estamparia</option>
                    <option value="perfumes">Perfumes</option>
                  </select>
                </FormField>
                <FormField label="Estoque">
                  <input
                    type="number"
                    min={0}
                    value={form.estoque}
                    onChange={(e) => setForm({ ...form, estoque: e.target.value })}
                    className="input"
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Preço (R$)">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={form.preco}
                    onChange={(e) => setForm({ ...form, preco: e.target.value })}
                    className="input"
                  />
                </FormField>
                <FormField label="Promocional (R$)">
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    value={form.preco_promocional}
                    onChange={(e) => setForm({ ...form, preco_promocional: e.target.value })}
                    className="input"
                  />
                </FormField>
              </div>
              <FormField label="Imagem do produto">
                <div className="space-y-2">
                  {form.imagem_url && (
                    <img
                      src={form.imagem_url}
                      alt="prévia"
                      className="w-24 h-24 object-cover rounded-lg border border-white/10"
                    />
                  )}
                  <label className="flex items-center gap-2 border border-dashed border-white/20 rounded-lg px-3 py-2 cursor-pointer hover:bg-white/5 text-sm">
                    <Upload className="size-4" />
                    {uploading ? "Enviando..." : "Selecionar imagem do computador"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error("Imagem maior que 5MB.");
                          return;
                        }
                        setUploading(true);
                        try {
                          const buf = await file.arrayBuffer();
                          let bin = "";
                          const bytes = new Uint8Array(buf);
                          for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
                          const base64 = btoa(bin);
                          const res = await upload({
                            data: { fileName: file.name, contentType: file.type || "image/jpeg", base64 },
                          });
                          setForm((prev) => (prev ? { ...prev, imagem_url: res.url } : prev));
                          toast.success("Imagem enviada");
                        } catch (err: any) {
                          toast.error(err?.message ?? "Falha no upload");
                        } finally {
                          setUploading(false);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                  <input
                    type="url"
                    value={form.imagem_url}
                    onChange={(e) => setForm({ ...form, imagem_url: e.target.value })}
                    placeholder="ou cole uma URL https://..."
                    className="input"
                  />
                </div>
              </FormField>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.ativo}
                    onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
                  />
                  Ativo
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.destaque}
                    onChange={(e) => setForm({ ...form, destaque: e.target.checked })}
                  />
                  Destaque
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={mut.isPending}
                  className="bg-brand text-primary-foreground px-6 py-2.5 rounded-full font-bold uppercase tracking-tight text-xs flex-1"
                >
                  {mut.isPending ? "Salvando..." : "Salvar"}
                </button>
                <button
                  type="button"
                  onClick={() => setForm(null)}
                  className="border border-white/20 px-6 py-2.5 rounded-full font-bold uppercase tracking-tight text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-tight mb-1.5 block opacity-80">
        {label}
      </span>
      {children}
    </label>
  );
}

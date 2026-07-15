import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { StoreNav } from "@/components/StoreNav";

export const Route = createFileRoute("/_authenticated/minha-conta")({
  head: () => ({ meta: [{ title: "Minha Conta — Emerson Store" }] }),
  component: MinhaContaPage,
});

type Profile = {
  nome: string;
  email: string | null;
  telefone: string | null;
  endereco: {
    rua?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
    complemento?: string;
  } | null;
};

function MinhaContaPage() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    nome: user?.name ?? "",
    email: user?.email ?? null,
    telefone: null,
    endereco: null,
  });

  useEffect(() => {
    (async () => {
      // Perfil no Supabase (opcional) — usa dados do Google OAuth como fallback
      if (!user?.email) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("nome,email,telefone,endereco")
        .eq("email", user.email)
        .maybeSingle();

      if (data) {
        setProfile(data as Profile);
      } else {
        setProfile((prev) => ({
          ...prev,
          nome: user.name ?? prev.nome,
          email: user.email ?? prev.email,
        }));
      }
      setLoading(false);
    })();
  }, [user]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (!user?.email) {
      setSaving(false);
      toast.error("Sessão inválida. Faça login novamente.");
      return;
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        email: user.email,
        nome: profile.nome,
        telefone: profile.telefone,
        endereco: profile.endereco,
      },
      { onConflict: "email" },
    );

    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Dados atualizados!");
  };

  const logout = async () => {
    try {
      await signOut("/");
    } catch {
      toast.error("Erro ao sair da conta.");
    }
  };

  const end = profile.endereco ?? {};
  const setEnd = (patch: Partial<NonNullable<Profile["endereco"]>>) =>
    setProfile({ ...profile, endereco: { ...end, ...patch } });

  return (
    <div className="bg-background text-foreground min-h-screen">
      <StoreNav />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-4xl font-display font-bold">Minha Conta</h1>
            {user && (
              <p className="text-sm opacity-70 mt-2">
                Olá, <span className="text-brand font-semibold">{user.name ?? user.email}</span>!
              </p>
            )}
          </div>
          <Link to="/meus-pedidos" className="text-sm font-bold uppercase tracking-tight text-brand hover:underline">
            Meus pedidos →
          </Link>
        </div>

        {loading ? (
          <p className="opacity-60">Carregando...</p>
        ) : (
          <form onSubmit={save} className="space-y-5">
            <Field label="Nome">
              <input
                value={profile.nome}
                onChange={(e) => setProfile({ ...profile, nome: e.target.value })}
                className="input"
                required
              />
            </Field>
            <Field label="Email">
              <input value={profile.email ?? ""} disabled className="input opacity-60" />
            </Field>
            <Field label="Telefone (WhatsApp)">
              <input
                value={profile.telefone ?? ""}
                onChange={(e) => setProfile({ ...profile, telefone: e.target.value })}
                placeholder="(11) 99999-9999"
                className="input"
              />
            </Field>

            <h2 className="text-xl font-bold pt-6">Endereço de entrega</h2>
            <div className="grid grid-cols-2 gap-4">
              <Field label="CEP">
                <input value={end.cep ?? ""} onChange={(e) => setEnd({ cep: e.target.value })} className="input" />
              </Field>
              <Field label="Estado">
                <input value={end.estado ?? ""} onChange={(e) => setEnd({ estado: e.target.value })} className="input" />
              </Field>
            </div>
            <Field label="Rua">
              <input value={end.rua ?? ""} onChange={(e) => setEnd({ rua: e.target.value })} className="input" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Número">
                <input value={end.numero ?? ""} onChange={(e) => setEnd({ numero: e.target.value })} className="input" />
              </Field>
              <Field label="Complemento">
                <input value={end.complemento ?? ""} onChange={(e) => setEnd({ complemento: e.target.value })} className="input" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Bairro">
                <input value={end.bairro ?? ""} onChange={(e) => setEnd({ bairro: e.target.value })} className="input" />
              </Field>
              <Field label="Cidade">
                <input value={end.cidade ?? ""} onChange={(e) => setEnd({ cidade: e.target.value })} className="input" />
              </Field>
            </div>

            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                disabled={saving}
                className="bg-brand text-primary-foreground px-8 py-3.5 rounded-full font-bold uppercase tracking-tight hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
              <button
                type="button"
                onClick={logout}
                className="border-2 border-white/20 hover:border-white/40 px-8 py-3.5 rounded-full font-bold uppercase tracking-tight transition-colors"
              >
                Sair
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-bold uppercase tracking-tight mb-2 block opacity-80">{label}</span>
      {children}
    </label>
  );
}

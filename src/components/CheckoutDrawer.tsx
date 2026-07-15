import { useState, useEffect } from "react";
import { X, Loader2, ChevronLeft, Check } from "lucide-react";
import { useCart, formatBRL } from "@/lib/cart-store";
import { buscarCep, calcularFreteFixo, onlyDigits, type OpcaoFrete } from "@/lib/frete";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { criarPedido } from "@/lib/pedidos.functions";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Props = { open: boolean; onClose: () => void };

type Endereco = {
  nome: string; telefone: string;
  cep: string; rua: string; numero: string; complemento: string;
  bairro: string; cidade: string; uf: string;
};

const enderecoVazio: Endereco = {
  nome: "", telefone: "",
  cep: "", rua: "", numero: "", complemento: "",
  bairro: "", cidade: "", uf: "",
};

export function CheckoutDrawer({ open, onClose }: Props) {
  const { items, clear } = useCart();
  const subtotal = items.reduce((s, it) => s + it.price * it.qty, 0);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [end, setEnd] = useState<Endereco>(enderecoVazio);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [opcoes, setOpcoes] = useState<OpcaoFrete[]>([]);
  const [freteSel, setFreteSel] = useState<OpcaoFrete | null>(null);
  const [loading, setLoading] = useState(false);

  const criar = useServerFn(criarPedido);
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setStep(1); setFreteSel(null); setOpcoes([]);
    }
  }, [open]);

  // Preenche nome/telefone do perfil
  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const { data: prof } = await supabase
        .from("profiles")
        .select("nome,telefone")
        .eq("id", session.user.id)
        .maybeSingle();
      if (prof) {
        setEnd((e) => ({
          ...e,
          nome: e.nome || (prof.nome ?? ""),
          telefone: e.telefone || (prof.telefone ?? ""),
        }));
      }
    })();
  }, [open]);

  const onCepBlur = async (cep: string) => {
    const c = onlyDigits(cep);
    if (c.length !== 8) return;
    setBuscandoCep(true);
    const r = await buscarCep(c);
    setBuscandoCep(false);
    if (!r) {
      toast.error("CEP não encontrado");
      return;
    }
    setEnd((e) => ({ ...e, cep: c, rua: r.rua || e.rua, bairro: r.bairro || e.bairro, cidade: r.cidade, uf: r.uf }));
  };

  const irParaFrete = () => {
    const required: (keyof Endereco)[] = ["nome","telefone","cep","rua","numero","bairro","cidade","uf"];
    for (const k of required) {
      if (!end[k] || end[k].toString().trim().length < 2) {
        toast.error("Preencha todos os campos obrigatórios");
        return;
      }
    }
    if (onlyDigits(end.cep).length !== 8) { toast.error("CEP inválido"); return; }
    if (end.uf.length !== 2) { toast.error("UF inválida"); return; }
    const opts = calcularFreteFixo(end.uf, subtotal);
    setOpcoes(opts);
    setFreteSel(opts[0]);
    setStep(2);
  };

  const finalizar = async () => {
    if (!freteSel) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.info("Entre na sua conta para finalizar");
        onClose();
        navigate({ to: "/auth" });
        return;
      }
      const payload = {
        itens: items.map((it) => ({
          id: it.id, productId: it.productId, category: it.category,
          name: it.name, price: it.price, qty: it.qty,
          image: it.image, options: it.options,
        })),
        endereco: { ...end, cep: onlyDigits(end.cep), uf: end.uf.toUpperCase() },
        frete: freteSel,
      };
      const pedido = await criar({ data: payload });
      clear();
      onClose();
      toast.success("Pedido registrado!");
      navigate({ to: "/pedido-confirmado", search: { id: pedido.id } });
    } catch (e: any) {
      toast.error(e?.message ?? "Erro ao registrar pedido");
    } finally {
      setLoading(false);
    }
  };

  const total = subtotal + (freteSel?.valor ?? 0);

  return (
    <>
      {open && <div onClick={onClose} className="fixed inset-0 bg-black/70 z-[80] backdrop-blur-sm" aria-hidden />}
      <aside
        className={`fixed top-0 right-0 z-[90] h-full w-full max-w-md bg-background border-l border-white/10 shadow-2xl transition-transform duration-300 flex flex-col ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            {step > 1 && (
              <button onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)} className="p-1 hover:bg-white/5 rounded-full">
                <ChevronLeft className="size-5" />
              </button>
            )}
            <h2 className="text-lg font-display font-bold">
              {step === 1 ? "Endereço" : step === 2 ? "Entrega" : "Confirmar"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full" aria-label="Fechar">
            <X className="size-5" />
          </button>
        </div>

        {/* steps indicator */}
        <div className="px-5 py-3 flex gap-1.5">
          {[1,2,3].map((n) => (
            <div key={n} className={`h-1 flex-1 rounded-full ${n <= step ? "bg-brand" : "bg-white/10"}`} />
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {step === 1 && (
            <>
              <Field label="Nome completo *" value={end.nome} onChange={(v) => setEnd({ ...end, nome: v })} />
              <Field label="WhatsApp *" value={end.telefone} onChange={(v) => setEnd({ ...end, telefone: v })} placeholder="(11) 99999-9999" />
              <div className="flex gap-3">
                <div className="w-32">
                  <Field
                    label="CEP *"
                    value={end.cep}
                    onChange={(v) => setEnd({ ...end, cep: onlyDigits(v) })}
                    onBlur={(v) => onCepBlur(v)}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                </div>
                {buscandoCep && <div className="self-end pb-3 text-xs opacity-60">Buscando...</div>}
              </div>
              <Field label="Rua *" value={end.rua} onChange={(v) => setEnd({ ...end, rua: v })} />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Número *" value={end.numero} onChange={(v) => setEnd({ ...end, numero: v })} />
                <Field label="Complemento" value={end.complemento} onChange={(v) => setEnd({ ...end, complemento: v })} />
              </div>
              <Field label="Bairro *" value={end.bairro} onChange={(v) => setEnd({ ...end, bairro: v })} />
              <div className="grid grid-cols-[1fr_5rem] gap-3">
                <Field label="Cidade *" value={end.cidade} onChange={(v) => setEnd({ ...end, cidade: v })} />
                <Field label="UF *" value={end.uf} onChange={(v) => setEnd({ ...end, uf: v.toUpperCase().slice(0,2) })} maxLength={2} />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-xs opacity-60">Entrega em {end.cidade}/{end.uf}</p>
              {opcoes.map((o) => (
                <button
                  key={o.servico}
                  onClick={() => setFreteSel(o)}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    freteSel?.servico === o.servico
                      ? "border-brand bg-brand/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">{o.servico}</div>
                      <div className="text-xs opacity-70">Prazo: {o.prazo} dia(s) útil(eis)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-brand">
                        {o.valor === 0 ? "GRÁTIS" : formatBRL(o.valor)}
                      </div>
                      {freteSel?.servico === o.servico && <Check className="size-4 ml-auto mt-1 text-brand" />}
                    </div>
                  </div>
                </button>
              ))}
              <p className="text-[10px] opacity-50 text-center pt-2">
                Frete estimado. Confirmação no envio.
              </p>
            </>
          )}

          {step === 3 && (
            <>
              <div className="bg-white/5 rounded-xl p-4 space-y-2 text-sm">
                <h3 className="font-bold uppercase tracking-tight text-xs opacity-70">Entrega</h3>
                <p>{end.nome} · {end.telefone}</p>
                <p className="opacity-80">{end.rua}, {end.numero}{end.complemento ? ` - ${end.complemento}` : ""}</p>
                <p className="opacity-80">{end.bairro} · {end.cidade}/{end.uf} · CEP {end.cep}</p>
                <p className="text-xs opacity-60 pt-1">{freteSel?.servico} — {freteSel?.prazo} dia(s)</p>
              </div>
              <div className="bg-white/5 rounded-xl p-4 space-y-1.5 text-sm">
                <h3 className="font-bold uppercase tracking-tight text-xs opacity-70 mb-2">Itens ({items.length})</h3>
                {items.map((it) => (
                  <div key={it.id} className="flex justify-between gap-2">
                    <span className="opacity-80 truncate">{it.qty}x {it.name}</span>
                    <span>{formatBRL(it.price * it.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="bg-white/5 rounded-xl p-4 space-y-1.5 text-sm">
                <Row label="Subtotal" value={formatBRL(subtotal)} />
                <Row label={`Frete (${freteSel?.servico})`} value={freteSel?.valor === 0 ? "GRÁTIS" : formatBRL(freteSel?.valor ?? 0)} />
                <div className="border-t border-white/10 pt-2 mt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-brand">{formatBRL(total)}</span>
                </div>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs">
                Pagamento online em breve. Após confirmar, combinaremos PIX ou outra forma pelo WhatsApp.
              </div>
            </>
          )}
        </div>

        <div className="border-t border-white/10 p-5">
          {step === 1 && (
            <button onClick={irParaFrete} className="w-full bg-brand text-primary-foreground rounded-full py-3.5 font-bold uppercase tracking-tight text-sm hover:scale-[1.02] transition-transform">
              Continuar
            </button>
          )}
          {step === 2 && (
            <button onClick={() => setStep(3)} disabled={!freteSel} className="w-full bg-brand text-primary-foreground rounded-full py-3.5 font-bold uppercase tracking-tight text-sm hover:scale-[1.02] transition-transform disabled:opacity-60">
              Revisar pedido
            </button>
          )}
          {step === 3 && (
            <button onClick={finalizar} disabled={loading} className="w-full bg-brand text-primary-foreground rounded-full py-3.5 font-bold uppercase tracking-tight text-sm hover:scale-[1.02] transition-transform disabled:opacity-60 flex items-center justify-center gap-2">
              {loading && <Loader2 className="size-4 animate-spin" />}
              {loading ? "Enviando..." : `Confirmar pedido · ${formatBRL(total)}`}
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

function Field({
  label, value, onChange, onBlur, placeholder, maxLength,
}: { label: string; value: string; onChange: (v: string) => void; onBlur?: (v: string) => void; placeholder?: string; maxLength?: number }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-tight opacity-70 mb-1.5 block">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand transition-colors"
      />
    </label>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="opacity-70">{label}</span>
      <span>{value}</span>
    </div>
  );
}

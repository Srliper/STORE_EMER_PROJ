// Frete grátis (definição do dono Emerson). CEP só para endereço de entrega.

export const CEP_ORIGEM = "18232128";

export type OpcaoFrete = {
  servico: string;
  prazo: number; // dias úteis
  valor: number; // BRL — sempre 0
};

/** Entrega sempre gratuita. */
export function freteGratis(): OpcaoFrete {
  return { servico: "Entrega grátis", prazo: 5, valor: 0 };
}

/** @deprecated Mantido por compatibilidade — sempre retorna frete grátis. */
export function calcularFreteFixo(_uf: string, _subtotal: number): OpcaoFrete[] {
  return [freteGratis()];
}

export const onlyDigits = (s: string) => s.replace(/\D/g, "");

export async function buscarCep(cep: string): Promise<{
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
} | null> {
  const c = onlyDigits(cep);
  if (c.length !== 8) return null;
  try {
    const res = await fetch(`https://viacep.com.br/ws/${c}/json/`);
    if (!res.ok) return null;
    const d = await res.json();
    if (d.erro) return null;
    return {
      cep: c,
      rua: d.logradouro ?? "",
      bairro: d.bairro ?? "",
      cidade: d.localidade ?? "",
      uf: d.uf ?? "",
    };
  } catch {
    return null;
  }
}

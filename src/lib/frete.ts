// Cálculo de frete simplificado por UF.
// Origem: CEP 18232-128 (SP). Substituir por Melhor Envio quando token disponível.

export const CEP_ORIGEM = "18232128";

const SUDESTE = ["RJ", "MG", "ES"];
const SUL = ["PR", "SC", "RS"];
const CENTRO_OESTE = ["DF", "GO", "MT", "MS"];
const NORDESTE = ["BA", "SE", "AL", "PE", "PB", "RN", "CE", "PI", "MA"];
const NORTE = ["TO", "PA", "AP", "RR", "AM", "AC", "RO"];

export type OpcaoFrete = {
  servico: string;
  prazo: number; // dias úteis
  valor: number; // BRL
};

export function calcularFreteFixo(uf: string, subtotal: number): OpcaoFrete[] {
  const u = uf.toUpperCase();
  let pac = 25;
  let sedex = 40;
  let prazoPac = 5;
  let prazoSedex = 2;

  if (u === "SP") {
    pac = 18; sedex = 30; prazoPac = 3; prazoSedex = 1;
  } else if (SUDESTE.includes(u)) {
    pac = 28; sedex = 45; prazoPac = 5; prazoSedex = 2;
  } else if (SUL.includes(u)) {
    pac = 32; sedex = 55; prazoPac = 6; prazoSedex = 3;
  } else if (CENTRO_OESTE.includes(u)) {
    pac = 38; sedex = 65; prazoPac = 7; prazoSedex = 3;
  } else if (NORDESTE.includes(u)) {
    pac = 45; sedex = 75; prazoPac = 9; prazoSedex = 4;
  } else if (NORTE.includes(u)) {
    pac = 55; sedex = 95; prazoPac = 12; prazoSedex = 5;
  }

  // Frete grátis acima de R$ 300 (modalidade econômica)
  if (subtotal >= 300) pac = 0;

  return [
    { servico: "PAC", prazo: prazoPac, valor: pac },
    { servico: "SEDEX", prazo: prazoSedex, valor: sedex },
  ];
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

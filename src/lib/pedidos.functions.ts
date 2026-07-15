import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const itemSchema = z.object({
  id: z.string().min(1).max(200),
  productId: z.string().min(1).max(200),
  category: z.string().min(1).max(40),
  name: z.string().min(1).max(200),
  price: z.number().min(0),
  qty: z.number().int().min(1).max(999),
  image: z.string().max(2000).optional(),
  options: z.record(z.string(), z.string()).optional(),
});

const enderecoSchema = z.object({
  nome: z.string().trim().min(2).max(120),
  telefone: z.string().trim().min(8).max(20),
  cep: z.string().regex(/^\d{8}$/),
  rua: z.string().trim().min(2).max(200),
  numero: z.string().trim().min(1).max(20),
  complemento: z.string().trim().max(100).optional().default(""),
  bairro: z.string().trim().min(2).max(120),
  cidade: z.string().trim().min(2).max(120),
  uf: z.string().trim().length(2),
});

const freteSchema = z.object({
  servico: z.string().min(1).max(40),
  prazo: z.number().int().min(0).max(60),
  valor: z.number().min(0).max(10000),
});

export const criarPedido = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) =>
    z
      .object({
        itens: z.array(itemSchema).min(1).max(50),
        endereco: enderecoSchema,
        frete: freteSchema,
        observacoes: z.string().max(1000).optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    const subtotal = data.itens.reduce((s, it) => s + it.price * it.qty, 0);
    const total = subtotal + data.frete.valor;

    const { data: inserted, error } = await supabase
      .from("pedidos")
      .insert({
        cliente_id: userId,
        produtos: data.itens,
        subtotal,
        frete: data.frete.valor,
        desconto: 0,
        total,
        status: "pendente",
        endereco_entrega: {
          ...data.endereco,
          frete_servico: data.frete.servico,
          frete_prazo_dias: data.frete.prazo,
        },
        observacoes: data.observacoes ?? null,
      })
      .select("id,created_at")
      .single();

    if (error) throw new Error(error.message);
    return { id: inserted.id, created_at: inserted.created_at };
  });

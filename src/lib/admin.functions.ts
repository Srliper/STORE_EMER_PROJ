import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase.rpc("has_role", {
    _user_id: userId,
    _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Acesso negado: somente administradores.");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    return { isAdmin: !!data };
  });

export const bootstrapAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId } = context;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: cErr } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "admin");
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) > 0) {
      throw new Error("Já existe um administrador. Peça para ele te promover.");
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin" });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);

    const [pedidosRes, clientesRes, produtosRes] = await Promise.all([
      supabase.from("pedidos").select("total,status,created_at"),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("produtos").select("id", { count: "exact", head: true }),
    ]);

    const pedidos = pedidosRes.data ?? [];
    const pagos = pedidos.filter((p: any) => p.status === "pago" || p.status === "enviado" || p.status === "entregue");
    const faturamento = pagos.reduce((s: number, p: any) => s + Number(p.total ?? 0), 0);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const vendasHoje = pagos.filter((p: any) => new Date(p.created_at) >= hoje).length;

    // últimos 7 dias
    const dias: { dia: string; total: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const total = pagos
        .filter((p: any) => {
          const t = new Date(p.created_at);
          return t >= d && t < next;
        })
        .reduce((s: number, p: any) => s + Number(p.total ?? 0), 0);
      dias.push({
        dia: d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
        total,
      });
    }

    return {
      totalPedidos: pedidos.length,
      totalPendentes: pedidos.filter((p: any) => p.status === "pendente").length,
      faturamento,
      comissao: faturamento * 0.1,
      vendasHoje,
      totalClientes: clientesRes.count ?? 0,
      totalProdutos: produtosRes.count ?? 0,
      ultimos7: dias,
    };
  });

export const comissaoPorProduto = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: pedidos, error } = await supabase
      .from("pedidos")
      .select("produtos,status,total,created_at")
      .in("status", ["pago", "enviado", "entregue"]);
    if (error) throw new Error(error.message);

    const agg = new Map<string, { nome: string; qtd: number; receita: number; comissao: number }>();
    let receitaTotal = 0;
    for (const p of pedidos ?? []) {
      const itens = Array.isArray(p.produtos) ? p.produtos : [];
      for (const it of itens as any[]) {
        const key = String(it.productId ?? it.id ?? it.name ?? "?");
        const nome = String(it.name ?? key);
        const qty = Number(it.qty ?? 1);
        const price = Number(it.price ?? 0);
        const rec = qty * price;
        receitaTotal += rec;
        const cur = agg.get(key) ?? { nome, qtd: 0, receita: 0, comissao: 0 };
        cur.qtd += qty;
        cur.receita += rec;
        cur.comissao += rec * 0.1;
        agg.set(key, cur);
      }
    }
    const linhas = Array.from(agg.values()).sort((a, b) => b.receita - a.receita);
    return {
      linhas,
      receitaTotal,
      comissaoTotal: receitaTotal * 0.1,
      pedidosPagos: (pedidos ?? []).length,
    };
  });

export const listarPedidosAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("pedidos")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { pedidos: data ?? [] };
  });

export const atualizarPedido = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status?: string; codigo_rastreio?: string }) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["pendente", "pago", "enviado", "entregue", "cancelado"]).optional(),
        codigo_rastreio: z.string().max(120).nullable().optional(),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const patch: any = {};
    if (data.status) patch.status = data.status;
    if (data.codigo_rastreio !== undefined) patch.codigo_rastreio = data.codigo_rastreio || null;
    const { error } = await supabase.from("pedidos").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listarProdutosAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data, error } = await supabase
      .from("produtos")
      .select("*")
      .order("categoria", { ascending: true })
      .order("ordem", { ascending: true });
    if (error) throw new Error(error.message);
    return { produtos: data ?? [] };
  });

const produtoSchema = z.object({
  id: z.string().uuid().optional(),
  nome: z.string().min(1).max(200),
  descricao: z.string().max(2000).nullable().optional(),
  categoria: z.enum(["vapes", "estamparia", "perfumes"]),
  preco: z.number().min(0),
  preco_promocional: z.number().min(0).nullable().optional(),
  estoque: z.number().int().min(0),
  ativo: z.boolean(),
  destaque: z.boolean(),
  imagem_url: z.string().url().nullable().optional(),
});

export const upsertProduto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => produtoSchema.parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    if (data.id) {
      const { id, ...patch } = data;
      const { error } = await supabase.from("produtos").update(patch).eq("id", id);
      if (error) throw new Error(error.message);
      return { ok: true, id };
    }
    const { data: inserted, error } = await supabase
      .from("produtos")
      .insert(data)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { ok: true, id: inserted.id };
  });

export const removerProduto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { error } = await supabase.from("produtos").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const uploadImagemProduto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { fileName: string; contentType: string; base64: string }) =>
    z
      .object({
        fileName: z.string().min(1).max(200),
        contentType: z.string().min(1).max(100),
        base64: z.string().min(1),
      })
      .parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const cleanName = data.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${userId}/${Date.now()}-${cleanName}`;
    const bytes = Uint8Array.from(atob(data.base64), (c) => c.charCodeAt(0));
    const { error } = await supabase.storage
      .from("produtos")
      .upload(path, bytes, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    const { data: signed, error: sErr } = await supabase.storage
      .from("produtos")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 10);
    if (sErr) throw new Error(sErr.message);
    return { url: signed.signedUrl };
  });

export const listarClientesAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id,nome,email,telefone,created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) throw new Error(error.message);

    const ids = (profiles ?? []).map((p: any) => p.id);
    let pedidosPorCliente: Record<string, { qtd: number; total: number }> = {};
    if (ids.length) {
      const { data: peds } = await supabase
        .from("pedidos")
        .select("cliente_id,total,status")
        .in("cliente_id", ids);
      (peds ?? []).forEach((p: any) => {
        const r = (pedidosPorCliente[p.cliente_id] ||= { qtd: 0, total: 0 });
        r.qtd += 1;
        if (["pago", "enviado", "entregue"].includes(p.status)) r.total += Number(p.total ?? 0);
      });
    }

    return {
      clientes: (profiles ?? []).map((p: any) => ({
        ...p,
        pedidos: pedidosPorCliente[p.id]?.qtd ?? 0,
        gasto: pedidosPorCliente[p.id]?.total ?? 0,
      })),
    };
  });

export const listarFuncionarios = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: roles, error } = await supabase
      .from("user_roles")
      .select("user_id,role,created_at")
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    const ids = (roles ?? []).map((r: any) => r.user_id);
    let profilesMap: Record<string, any> = {};
    if (ids.length) {
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,nome,email")
        .in("id", ids);
      (profs ?? []).forEach((p: any) => (profilesMap[p.id] = p));
    }
    return {
      admins: (roles ?? []).map((r: any) => ({
        user_id: r.user_id,
        created_at: r.created_at,
        nome: profilesMap[r.user_id]?.nome ?? "",
        email: profilesMap[r.user_id]?.email ?? "",
      })),
    };
  });

export const promoverAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { email: string }) =>
    z.object({ email: z.string().email() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", data.email)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!profile) throw new Error("Nenhum usuário cadastrado com esse email.");
    const { error: insErr } = await supabase
      .from("user_roles")
      .insert({ user_id: profile.id, role: "admin" });
    if (insErr && !insErr.message.includes("duplicate")) throw new Error(insErr.message);
    return { ok: true };
  });

export const revogarAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { user_id: string }) =>
    z.object({ user_id: z.string().uuid() }).parse(d),
  )
  .handler(async ({ context, data }) => {
    const { supabase, userId } = context;
    await assertAdmin(supabase, userId);
    if (data.user_id === userId) {
      throw new Error("Você não pode revogar seu próprio acesso admin.");
    }
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", "admin");
    if (error) throw new Error(error.message);
    return { ok: true };
  });

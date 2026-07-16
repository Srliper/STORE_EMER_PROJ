/**
 * Contas com acesso ao painel Admin (Emerson Store).
 * Comissão do gestor: 10% por produto (sobre receita de pedidos pagos).
 */
export const ADMIN_OWNER_EMAIL = "emerstore385@gmail.com";
export const ADMIN_GESTOR_EMAIL = "luisferbedim123@gmail.com";

/** Taxa de comissão do gestor (10% por produto) */
export const GESTOR_COMMISSION_RATE = 0.1;

export const ADMIN_ALLOWLIST = [
  ADMIN_OWNER_EMAIL.toLowerCase(),
  ADMIN_GESTOR_EMAIL.toLowerCase(),
] as const;

export type AdminRole = "owner" | "gestor" | null;

export function normalizeEmail(email?: string | null): string {
  return (email ?? "").trim().toLowerCase();
}

export function isAdminEmail(email?: string | null): boolean {
  const e = normalizeEmail(email);
  return !!e && (ADMIN_ALLOWLIST as readonly string[]).includes(e);
}

export function getAdminRole(email?: string | null): AdminRole {
  const e = normalizeEmail(email);
  if (e === ADMIN_OWNER_EMAIL.toLowerCase()) return "owner";
  if (e === ADMIN_GESTOR_EMAIL.toLowerCase()) return "gestor";
  return null;
}

export function commissionRateForEmail(email?: string | null): number {
  const role = getAdminRole(email);
  if (role === "gestor" || role === "owner") return GESTOR_COMMISSION_RATE;
  return 0;
}

# Vercel — STORE_EMER_PROJ

## Environment Variables (Production + Preview)

| Variável | Valor |
|----------|-------|
| `SUPABASE_URL` | `https://hhvzklzxtpaieqdxkymq.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | chave anon |
| `VITE_SUPABASE_URL` | mesma URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | mesma chave |
| `SUPABASE_SERVICE_ROLE_KEY` | chave **service_role** (Settings → API) — corrige RLS ao promover na Equipe |

> Nunca exponha `SERVICE_ROLE` no frontend. Só em Environment Variables da Vercel (server).

## Admin definitivo (só logar)

| Papel | Nome | Email | Comissão |
|-------|------|-------|----------|
| Dono | Emerson | `emerstore385@gmail.com` | 10% |
| Gestor | Luis Fernando Bedim | `luisferbedim123@gmail.com` | 10% |

Botão **Admin** aparece automaticamente após login com essas contas.

## Google OAuth (Supabase)

1. Authentication → Providers → Google → Enable + Client ID/Secret  
2. Google Console redirect URI:
   `https://hhvzklzxtpaieqdxkymq.supabase.co/auth/v1/callback`
3. Authentication → URL Configuration → Redirect URLs:
   - `http://localhost:5173/**`
   - `https://SEU-APP.vercel.app/**`
   - `https://SEU-APP.vercel.app/auth/callback`
4. Site URL = `https://SEU-APP.vercel.app`

## Após mudar variáveis

Redeploy do commit mais recente em `main` (sem build cache).

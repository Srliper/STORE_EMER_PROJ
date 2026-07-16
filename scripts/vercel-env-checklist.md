# Vercel — STORE_EMER_PROJ

## Environment Variables (Production + Preview)

| Variável | Valor |
|----------|-------|
| `SUPABASE_URL` | `https://hhvzklzxtpaieqdxkymq.supabase.co` |
| `SUPABASE_PUBLISHABLE_KEY` | chave anon |
| `VITE_SUPABASE_URL` | mesma URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | mesma chave |

## Google OAuth (Supabase — não Vercel)

1. Supabase → Authentication → Providers → Google → Enable
2. Client ID: do Google Cloud
3. Client Secret: do Google Cloud
4. Google Console redirect URI **obrigatória**:
   `https://hhvzklzxtpaieqdxkymq.supabase.co/auth/v1/callback`
5. Supabase Redirect URLs (obrigatório — senão volta pra home sem login):
   - `http://localhost:5173/**`
   - `https://SEU-APP.vercel.app/**`
   - `https://SEU-APP.vercel.app/auth/callback`
6. Site URL no Supabase = `https://SEU-APP.vercel.app`

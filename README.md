# Emerson Store — STORE_EMER_PROJ

Loja Emerson (vapes, camisetas, perfumes) com **TanStack Start** + **Supabase** + **login Google nativo**.

## Stack

- TanStack Start + Vite + React
- Supabase (banco + Auth)
- Google OAuth via Supabase (sem Lovable Auth, sem Auth.js)
- Deploy: Vercel

## Login Google — configurar uma vez

### 1. Google Cloud Console
- OAuth Client tipo **Web application**
- **Authorized JavaScript origins:**
  - `http://localhost:5173`
  - `https://SEU-PROJETO.vercel.app`
- **Authorized redirect URIs:**
  - `https://hhvzklzxtpaieqdxkymq.supabase.co/auth/v1/callback`

### 2. Supabase Dashboard
- **Authentication → Providers → Google** → Enable
- Cole Client ID + Client Secret
- **Authentication → URL Configuration → Redirect URLs:**
  - `http://localhost:5173/**`
  - `https://SEU-PROJETO.vercel.app/**`

### 3. Variáveis (local `.env` e Vercel)

```
SUPABASE_URL=https://hhvzklzxtpaieqdxkymq.supabase.co
SUPABASE_PUBLISHABLE_KEY=sua_chave_anon
VITE_SUPABASE_URL=https://hhvzklzxtpaieqdxkymq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_anon
```

## Desenvolvimento

```bash
cd STORE_EMER_PROJ
npm install
npm run dev
```

## Deploy Vercel

1. Importar este repositório no Vercel
2. Adicionar as 4 variáveis acima (Production + Preview)
3. Deploy — **não** faça redeploy de builds antigos de outros repos

## Nota

O build ainda usa `@lovable.dev/vite-tanstack-config` (plugin de Vite). **Login e runtime não dependem do Lovable.**

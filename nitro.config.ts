import { defineNitroConfig } from "nitro/config";

/**
 * Garante que tslib e @supabase/* sejam bundlados no server (Vercel serverless).
 * Duplica vite.config.ts nitro — Nitro lê este arquivo no build da Vercel.
 */
export default defineNitroConfig({
  preset: "vercel",
  noExternals: ["tslib", /^@supabase\//],
  traceDeps: ["tslib", "@supabase/*"],
});

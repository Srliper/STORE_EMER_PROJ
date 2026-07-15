// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

const mode = process.env.NODE_ENV === "production" ? "production" : "development";
const env = loadEnv(mode, process.cwd(), "");

function hasEnv(...keys: string[]) {
  return keys.some((key) => Boolean(env[key]?.trim()));
}

// Login Google = Lovable Cloud Auth (sem AUTH_SECRET). Supabase ainda é obrigatório.
if (mode === "production") {
  const missing: string[] = [];
  if (!hasEnv("VITE_SUPABASE_URL", "SUPABASE_URL")) missing.push("VITE_SUPABASE_URL / SUPABASE_URL");
  if (!hasEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY")) {
    missing.push("VITE_SUPABASE_PUBLISHABLE_KEY / SUPABASE_PUBLISHABLE_KEY");
  }
  if (missing.length > 0) {
    console.warn(
      `[@lovable.dev/vite-tanstack-config] Variáveis ausentes no build: ${missing.join(", ")}`,
    );
  }
}

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
    serverFns: { disableCsrfMiddlewareWarning: true },
  },
  nitro: {
    preset: "vercel",
    noExternals: ["tslib", /^@supabase\//],
    traceDeps: ["tslib", "@supabase/*"],
  },
  vite: {
    optimizeDeps: {
      include: ["tslib", "@supabase/supabase-js"],
    },
    ssr: {
      noExternal: ["tslib", "@supabase/supabase-js", /^@supabase\/.*/],
    },
    envPrefix: ["VITE_"],
    base: "/",
    build: {
      outDir: "dist",
      sourcemap: mode !== "production",
    },
    server: {
      port: 5173,
      strictPort: false,
    },
  },
});

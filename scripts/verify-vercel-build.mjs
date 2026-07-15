#!/usr/bin/env node
/**
 * Verifica se o build Vercel embutiu tslib (sem import externo).
 * Rode após: npm run build
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const outDir = join(process.cwd(), ".vercel/output/functions/__server.func");
const libsDir = join(outDir, "_libs");

if (!existsSync(outDir)) {
  console.error("✗ Rode npm run build primeiro.");
  process.exit(1);
}

const problems = [];

// Build antigo (quebrado): chunk separado com import externo
if (existsSync(join(libsDir, "supabase__auth-js.mjs"))) {
  const content = readFileSync(join(libsDir, "supabase__auth-js.mjs"), "utf8");
  if (content.includes('from "tslib"')) {
    problems.push("_libs/supabase__auth-js.mjs ainda importa tslib externamente (build antigo)");
  }
}

// Varre todos os .mjs por imports externos de tslib
function scanDir(dir) {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, name.name);
    if (name.isDirectory()) scanDir(path);
    else if (name.name.endsWith(".mjs")) {
      const content = readFileSync(path, "utf8");
      if (/from\s+["']tslib["']/.test(content)) {
        problems.push(`${path.replace(outDir + "/", "")} importa tslib externamente`);
      }
    }
  }
}

scanDir(outDir);

console.log("\n=== verify-vercel-build ===\n");

if (problems.length === 0) {
  const ssrFiles = readdirSync(join(outDir, "_ssr")).filter((f) => f.startsWith("index-"));
  console.log("✓ Nenhum import externo de tslib no bundle.");
  console.log(`✓ Chunks SSR: ${ssrFiles.join(", ") || "(nenhum)"}`);
  console.log("✓ Build pronto para Vercel.\n");
  process.exit(0);
}

console.log("✗ Problemas encontrados:\n");
for (const p of problems) console.log(`  - ${p}`);
console.log("\nConfira vite.config.ts: nitro.noExternals e vite.ssr.noExternal\n");
process.exit(1);

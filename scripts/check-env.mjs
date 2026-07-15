#!/usr/bin/env node
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadDotEnv() {
  const path = resolve(process.cwd(), ".env");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

function get(...keys) {
  for (const key of keys) {
    const v = process.env[key];
    if (v && !v.startsWith("sua_")) return v;
  }
  return undefined;
}

const missing = [
  { keys: ["SUPABASE_URL", "VITE_SUPABASE_URL"], label: "SUPABASE_URL" },
  {
    keys: ["SUPABASE_PUBLISHABLE_KEY", "VITE_SUPABASE_PUBLISHABLE_KEY"],
    label: "SUPABASE_PUBLISHABLE_KEY",
  },
].filter(({ keys }) => !get(...keys));

console.log("\n=== STORE_EMER_PROJ — check-env ===\n");
console.log("Login Google: Supabase → Authentication → Providers → Google\n");

if (missing.length === 0) {
  console.log("✓ Supabase OK.\n");
  process.exit(0);
}

console.log("✗ Ausentes:\n");
for (const { label } of missing) console.log(`  - ${label}`);
process.exit(1);

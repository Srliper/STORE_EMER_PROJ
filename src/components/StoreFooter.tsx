import { WHATSAPP_NUMBER } from "@/lib/whatsapp";

export const OWNER_EMAIL = "emerstore385@gmail.com";

export function StoreFooter() {
  return (
    <footer className="bg-surface border-t border-white/5 py-12">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-3 bg-brand/10 text-brand px-6 py-3 rounded-full mb-8">
          <span className="size-2 bg-brand rounded-full animate-pulse" />
          <span className="text-sm font-bold uppercase tracking-widest">
            Entrega rápida na sua região
          </span>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          © 2026 Emerson Store — Estilo e Atitude
        </p>
        <div className="flex flex-wrap justify-center gap-6 text-xs font-bold uppercase tracking-tighter">
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-brand"
          >
            WhatsApp (15) 98118-3740
          </a>
          <a href={`mailto:${OWNER_EMAIL}`} className="hover:text-brand normal-case tracking-normal">
            {OWNER_EMAIL}
          </a>
        </div>
      </div>
    </footer>
  );
}

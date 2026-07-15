import heroImg from "@/assets/hero-street.jpg";
import { openWhatsApp } from "@/lib/whatsapp";

export function Hero() {
  return (
    <section id="top" className="relative h-[80vh] min-h-[600px] flex items-center overflow-hidden">
      <img
        src={heroImg}
        alt="Atmosfera urbana neon"
        width={1920}
        height={1280}
        className="absolute inset-0 w-full h-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <span className="inline-block text-brand font-bold text-xs uppercase tracking-[0.3em] mb-6 border border-brand/40 px-3 py-1 rounded-full">
          Drop 2026 — Entrega Delivery
        </span>
        <h1 className="text-6xl md:text-8xl font-display font-bold leading-[0.9] mb-6 italic tracking-tighter">
          STREET<br />
          <span className="text-brand">ESSENTIALS.</span>
        </h1>
        <p className="max-w-md text-muted-foreground mb-8 text-lg">
          Pods Ignite, perfumes contratipos premium e estamparia personalizada de anime.
          Tudo entregue na sua porta.
        </p>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() =>
              openWhatsApp("Olá Emerson! Quero fazer um pedido pela loja.")
            }
            className="bg-brand text-primary-foreground px-8 py-4 font-bold uppercase text-sm hover:scale-105 transition-transform rounded-md"
          >
            Pedir no WhatsApp
          </button>
          <a
            href="#shirts"
            className="border border-white/20 text-foreground px-8 py-4 font-bold uppercase text-sm hover:bg-white/5 transition-colors rounded-md"
          >
            Personalizar Camiseta
          </a>
        </div>
      </div>
    </section>
  );
}

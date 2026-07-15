import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { z } from "zod";
import { openWhatsApp } from "@/lib/whatsapp";

export const Route = createFileRoute("/pedido-confirmado")({
  validateSearch: z.object({ id: z.string().optional() }),
  component: PedidoConfirmado,
  head: () => ({
    meta: [
      { title: "Pedido confirmado" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function PedidoConfirmado() {
  const { id } = Route.useSearch();
  const codigo = id ? id.slice(0, 8).toUpperCase() : "—";

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-green-500/20 text-green-300">
          <CheckCircle2 className="size-12" />
        </div>
        <h1 className="text-3xl font-display font-bold">Pedido confirmado!</h1>
        <p className="opacity-70">
          Seu pedido <span className="font-mono font-bold">#{codigo}</span> foi registrado.
          Em breve entraremos em contato para combinar o pagamento.
        </p>
        <div className="flex flex-col gap-3 pt-4">
          <button
            onClick={() => openWhatsApp(`Olá! Sobre meu pedido #${codigo}`)}
            className="w-full bg-brand text-primary-foreground rounded-full py-3.5 font-bold uppercase tracking-tight text-sm"
          >
            Falar no WhatsApp
          </button>
          <Link
            to="/"
            className="w-full border border-white/20 rounded-full py-3.5 font-bold uppercase tracking-tight text-sm hover:bg-white/5"
          >
            Voltar para a loja
          </Link>
        </div>
      </div>
    </main>
  );
}

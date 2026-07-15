import fortune from "@/assets/perfume-fortune.jpg";
import poloClub from "@/assets/perfume-polo-club.jpg";
import racingCar from "@/assets/perfume-racing-car.jpg";
import vipRose from "@/assets/perfume-521-rose.jpg";
import vipBlack from "@/assets/perfume-521-black.jpg";
import { openWhatsApp } from "@/lib/whatsapp";
import { useCart, parsePrice } from "@/lib/cart-store";
import { toast } from "sonner";

const PERFUMES = [
  {
    name: "Perfume Fortune Parfum Bortoletto 100ml",
    ref: "Insp. One Million (Paco Rabanne)",
    family: "Masculino • 100ml",
    description:
      "O perfume masculino mais fácil de vender, com aroma amadeirado e sedutor.",
    price: "R$ 92,28",
    image: fortune,
  },
  {
    name: "Perfume Polo Club Parfum Bortoletto 100ml",
    ref: "Insp. Polo Blue (Ralph Lauren)",
    family: "Masculino • 100ml",
    description:
      "Opção fresca, aquática e elegante, perfeita para uso diário e climas quentes.",
    price: "R$ 139,98",
    image: poloClub,
  },
  {
    name: "Perfume Racing Car 100ml Atlântica Natural - Bortoletto",
    ref: "Insp. Ferrari Black",
    family: "Masculino • 100ml",
    description:
      "Um dos aromas cítricos/amadeirados mais populares do Brasil, com venda rápida garantida.",
    price: "R$ 205,42",
    image: racingCar,
  },
  {
    name: "Perfume Bortoletto 521 Vip Rose Feminino 100ml",
    ref: "Insp. 212 VIP Rosé",
    family: "Feminino • 100ml",
    description:
      "Fragrância floral amadeirada muito procurada para festas e eventos cotidianos.",
    price: "R$ 180,00",
    image: vipRose,
  },
  {
    name: "Perfume 521 Vip Black 100ml Atlântica Natural - Bortoletto",
    ref: "Insp. 212 VIP Black",
    family: "Masculino • 100ml",
    description:
      "Aroma moderno e marcante muito desejado pelo público jovem para a noite.",
    price: "R$ 187,92",
    image: vipBlack,
  },
];

export function PerfumesSection() {
  const addToCart = useCart((s) => s.add);
  return (
    <section id="perfumes" className="py-24 max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <span className="text-brand font-bold text-xs uppercase tracking-[0.3em]">
          Linha Inspirada
        </span>
        <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 italic mt-2">
          Perfumes estilo Bortoleto
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Seleção com fragrâncias femininas e masculinas no estilo das referências
          que você enviou, pronta para pedir no delivery pelo WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PERFUMES.map((p) => (
          <div
            key={p.name}
            className="group text-left bg-surface rounded-2xl border border-white/5 overflow-hidden hover:border-brand/50 transition-colors flex flex-col"
          >
            <div className="w-full aspect-[4/5] overflow-hidden ring-1 ring-white/5">
              <img
                src={p.image}
                alt={p.name}
                loading="lazy"
                width={640}
                height={800}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5 flex flex-col flex-1">
              <h4 className="font-bold text-lg leading-snug">{p.name}</h4>
              <p className="text-xs text-muted-foreground uppercase mt-1">{p.ref}</p>
              <p className="text-sm text-muted-foreground mt-2">{p.family}</p>
              <p className="text-sm text-muted-foreground/80 mt-2">{p.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-brand font-bold italic">{p.price}</span>
                <button
                  onClick={() =>
                    openWhatsApp(
                      `Olá! Quero pedir o perfume ${p.name}\n• Estilo: ${p.ref}\n• Categoria: ${p.family}\n• Valor: ${p.price}`,
                    )
                  }
                  className="text-xs uppercase font-semibold opacity-60 hover:opacity-100 transition-opacity"
                >
                  WhatsApp
                </button>
              </div>
              <button
                onClick={() => {
                  addToCart({
                    id: p.name,
                    productId: p.name,
                    category: "perfume",
                    name: p.name,
                    price: parsePrice(p.price),
                    image: p.image,
                    options: { Estilo: p.ref, Categoria: p.family },
                  });
                  toast.success(`${p.name} adicionado ao carrinho`);
                }}
                className="mt-4 w-full bg-brand text-primary-foreground py-2.5 rounded-lg text-xs font-bold uppercase hover:scale-[1.02] transition-transform"
              >
                Adicionar ao carrinho
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

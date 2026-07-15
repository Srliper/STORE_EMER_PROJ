import { useState } from "react";
import v150 from "@/assets/vape-v150.jpg";
import v250 from "@/assets/vape-v250.jpg";
import v300 from "@/assets/vape-v300.jpg";
import smokingSilverCover from "@/assets/smoking-silver-cover.jpg";
import { openWhatsApp } from "@/lib/whatsapp";
import { useCart, parsePrice } from "@/lib/cart-store";
import { toast } from "sonner";

type Vape = {
  id: string;
  name: string;
  image: string;
  price: string;
  puffs: string;
  flavors: string[];
};

const VAPES: Vape[] = [
  {
    id: "v155",
    name: "Ignite V155 Ultra Slim",
    image: v150,
    price: "R$ 100,00",
    puffs: "15.5k puffs",
    flavors: [
      "Banana Ice",
      "Uva Ice",
      "Watermelon Ice",
      "Strawberry",
      "Cherry",
      "Miami Mint",
    ],
  },
  {
    id: "v250",
    name: "Ignite V250",
    image: v250,
    price: "R$ 130,00",
    puffs: "25k puffs",
    flavors: [
      "Strawberry Watermelon",
      "Banana Ice",
      "Strawberry Kiwi",
      "Pineapple Ice",
    ],
  },
  {
    id: "v300",
    name: "Ignite V300",
    image: v300,
    price: "R$ 150,00",
    puffs: "30k puffs",
    flavors: [
      "Pineapple Ice",
      "Strawberry",
      "Cherry Ice",
      "Tropical Mix",
      "Mint Power",
    ],
  },
  {
    id: "mix",
    name: "Ignite MIX",
    image: v250,
    price: "R$ 120,00",
    puffs: "Multi-sabor",
    flavors: [
      "Watermelon Ice",
      "Strawberry",
      "Cherry Cool",
      "Miami Mint",
      "Banana Ice",
      "Uva Ice",
    ],
  },
  {
    id: "airmez",
    name: "Airmez 2 in 1",
    image: v300,
    price: "R$ 110,00",
    puffs: "2 sabores no mesmo pod",
    flavors: ["Strawberry + Grape", "Coal Mint", "Watermelon + Ice"],
  },
  {
    id: "eternity",
    name: "Eternity 28.000 puffs",
    image: v150,
    price: "R$ 170,00",
    puffs: "28k puffs",
    flavors: [
      "Strawberry Watermelon",
      "Banana Ice",
      "Uva Ice",
      "Mint Power",
    ],
  },
];

export function VapesSection() {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const addToCart = useCart((s) => s.add);

  const addCart = (v: Vape) => {
    const flavor = picked[v.id] ?? v.flavors[0];
    addToCart({
      id: `${v.id}-${flavor}`,
      productId: v.id,
      category: "vape",
      name: v.name,
      price: parsePrice(v.price),
      image: v.image,
      options: { Sabor: flavor, Capacidade: v.puffs },
    });
    toast.success(`${v.name} adicionado ao carrinho`);
  };

  const orderWhats = (v: Vape) => {
    const flavor = picked[v.id] ?? v.flavors[0];
    openWhatsApp(
      `Olá! Quero pedir um pod ${v.name}\n• Capacidade: ${v.puffs}\n• Sabor: ${flavor}\n• Valor: ${v.price}`,
    );
  };

  return (
    <section id="vapes" className="py-24 max-w-7xl mx-auto px-6">
      <div className="relative w-full rounded-3xl overflow-hidden mb-12 border border-white/10">
        <img
          src={smokingSilverCover}
          alt="Smoking Silver — coleção de pods Ignite"
          width={1536}
          height={1024}
          loading="lazy"
          className="w-full h-[280px] md:h-[420px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10">
          <span className="text-brand font-bold text-xs uppercase tracking-[0.2em]">
            New Drop
          </span>
          <h2 className="text-4xl md:text-6xl font-display font-bold tracking-tighter mt-1">
            IGNITE PODS
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-base">
            Escolha o modelo, confira a média de puffs e selecione o sabor.
          </p>
        </div>
      </div>


      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {VAPES.map((v) => (
          <article
            key={v.id}
            className="bg-surface p-6 rounded-2xl border border-white/5 hover:border-brand/50 transition-colors group flex flex-col"
          >
            <div className="w-full aspect-square bg-background rounded-xl mb-6 overflow-hidden">
              <img
                src={v.image}
                alt={v.name}
                loading="lazy"
                width={768}
                height={768}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="text-xl font-bold">{v.name}</h3>
              <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-white/5 text-brand">
                {v.puffs}
              </span>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Sabores disponíveis: {v.flavors.join(", ")}.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {v.flavors.map((f) => (
                <button
                  key={f}
                  onClick={() => setPicked((p) => ({ ...p, [v.id]: f }))}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold uppercase transition-colors text-left ${
                    (picked[v.id] ?? v.flavors[0]) === f
                      ? "bg-brand text-primary-foreground"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            <div className="mt-auto pt-4 border-t border-white/5 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-brand font-bold text-lg">{v.price}</span>
                <button
                  onClick={() => orderWhats(v)}
                  className="text-xs font-semibold uppercase opacity-60 hover:opacity-100 transition-opacity"
                >
                  WhatsApp
                </button>
              </div>
              <button
                onClick={() => addCart(v)}
                className="w-full px-4 py-2.5 bg-brand text-primary-foreground rounded-lg text-xs font-bold uppercase hover:scale-[1.02] transition-transform"
              >
                Adicionar ao carrinho
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

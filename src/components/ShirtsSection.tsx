import { useRef, useState } from "react";
import shirt1 from "@/assets/shirt-anime-1.jpg";
import shirt2 from "@/assets/shirt-anime-2.jpg";
import shirt3 from "@/assets/shirt-anime-3.jpg";
import { openWhatsApp } from "@/lib/whatsapp";
import { useCart } from "@/lib/cart-store";
import { toast } from "sonner";

const SHIRT_PRICE = 79.9;

const PRESETS = [
  { id: "p1", name: "Drop Demon Style", image: shirt1 },
  { id: "p2", name: "Drop Attack Mono", image: shirt2 },
  { id: "p3", name: "Drop Akatsuki Street", image: shirt3 },
];

const SIZES = ["P", "M", "G", "GG"];
const COLORS = ["Preta", "Branca", "Off-White"];

export function ShirtsSection() {
  const [size, setSize] = useState("M");
  const [color, setColor] = useState("Preta");
  const [preset, setPreset] = useState<string | null>("p1");
  const [uploadName, setUploadName] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const addToCart = useCart((s) => s.add);

  const onUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadName(f.name);
    setPreset(null);
    setUploadPreview(URL.createObjectURL(f));
  };

  const selectedPreset = PRESETS.find((p) => p.id === preset);
  const artLabel = uploadName
    ? `Arte personalizada (${uploadName})`
    : selectedPreset?.name ?? "—";
  const previewImage = uploadPreview ?? selectedPreset?.image ?? shirt1;

  const addCart = () => {
    addToCart({
      id: `shirt-${size}-${color}-${uploadName ?? preset}`,
      productId: "shirt",
      category: "shirt",
      name: `Camiseta — ${artLabel}`,
      price: SHIRT_PRICE,
      image: previewImage,
      options: { Tamanho: size, Cor: color, Estampa: artLabel },
    });
    toast.success("Camiseta adicionada ao carrinho");
  };

  const orderWhats = () => {
    openWhatsApp(
      `Olá! Quero personalizar uma camiseta\n• Tamanho: ${size}\n• Cor base: ${color}\n• ${artLabel}\n• Valor: R$ ${SHIRT_PRICE.toFixed(2).replace(".", ",")}`,
    );
  };

  return (
    <section id="shirts" className="bg-brand py-24 text-primary-foreground overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          <div>
            <h2 className="text-5xl md:text-6xl font-display font-bold leading-tight mb-8">
              CAMISETAS DE ANIME E
              <span className="bg-primary-foreground text-brand px-3 ml-3 inline-block">
                ESTAMPA PRÓPRIA
              </span>
            </h2>
            <p className="text-lg md:text-xl mb-10 font-medium opacity-80 max-w-lg">
              Escolha uma arte no estilo das referências enviadas ou mande sua própria
              imagem para produzir a camiseta personalizada.
            </p>

            <div className="space-y-5">
              <div>
                <label className="font-bold uppercase tracking-tight text-xs mb-2 block">
                  01 — Tamanho
                </label>
                <div className="flex gap-2 flex-wrap">
                  {SIZES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`size-12 rounded-full font-bold border-2 transition-all ${
                        size === s
                          ? "bg-primary-foreground text-brand border-primary-foreground"
                          : "border-primary-foreground/30 hover:border-primary-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-tight text-xs mb-2 block">
                  02 — Cor da camiseta
                </label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      className={`px-5 py-2.5 rounded-full font-bold text-sm border-2 transition-all ${
                        color === c
                          ? "bg-primary-foreground text-brand border-primary-foreground"
                          : "border-primary-foreground/30 hover:border-primary-foreground"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold uppercase tracking-tight text-xs mb-2 block">
                  03 — Enviar sua imagem
                </label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="w-full border-2 border-dashed border-primary-foreground/40 hover:border-primary-foreground rounded-xl p-5 text-left transition-colors bg-primary-foreground/5"
                >
                  <div className="font-bold uppercase text-sm">
                    {uploadName ?? "Clique para enviar sua arte"}
                  </div>
                  <div className="text-xs opacity-70 mt-1">
                    PNG ou JPG até 10MB. Também fazemos baseado na imagem que você mandar.
                  </div>
                </button>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={addCart}
                  className="flex-1 bg-primary-foreground text-brand px-8 py-4 font-bold uppercase text-sm rounded-full hover:scale-105 transition-transform"
                >
                  Adicionar — R$ {SHIRT_PRICE.toFixed(2).replace(".", ",")}
                </button>
                <button
                  onClick={orderWhats}
                  className="px-6 py-4 font-bold uppercase text-sm rounded-full border-2 border-primary-foreground/40 hover:border-primary-foreground transition-colors"
                >
                  WhatsApp
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="aspect-[4/5] bg-primary-foreground/10 rounded-3xl overflow-hidden relative">
              <img
                src={uploadPreview ?? PRESETS.find((p) => p.id === preset)?.image ?? shirt1}
                alt="Preview da estampa"
                loading="lazy"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4 bg-primary-foreground text-brand text-xs font-bold uppercase px-3 py-1.5 rounded-full">
                Preview
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3 opacity-70">
                Escolha uma estampa pronta
              </p>
              <div className="grid grid-cols-3 gap-3">
                {PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setPreset(p.id);
                      setUploadName(null);
                      setUploadPreview(null);
                    }}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      preset === p.id && !uploadPreview
                        ? "border-primary-foreground scale-95"
                        : "border-transparent hover:border-primary-foreground/40"
                    }`}
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

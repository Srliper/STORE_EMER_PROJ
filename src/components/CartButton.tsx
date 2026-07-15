import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-store";

export function CartButton() {
  const { items, toggle } = useCart();
  const count = items.reduce((a, b) => a + b.qty, 0);

  return (
    <button
      onClick={toggle}
      className="relative flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-tight transition-colors"
      aria-label="Abrir carrinho"
    >
      <ShoppingBag className="size-4" />
      <span className="hidden sm:inline">Carrinho</span>
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 bg-brand text-primary-foreground text-[10px] font-bold size-5 rounded-full flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}

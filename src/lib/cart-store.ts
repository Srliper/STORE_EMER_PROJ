import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string; // unique line id
  productId: string;
  category: "vape" | "perfume" | "shirt";
  name: string;
  price: number; // BRL
  image: string;
  qty: number;
  options?: Record<string, string>;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: Omit<CartItem, "qty"> & { qty?: number }) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
  toggle: () => void;
};

const sameLine = (a: CartItem, b: Omit<CartItem, "qty">) =>
  a.productId === b.productId &&
  JSON.stringify(a.options ?? {}) === JSON.stringify(b.options ?? {});

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item) =>
        set((s) => {
          const qty = item.qty ?? 1;
          const existing = s.items.find((it) => sameLine(it, item));
          if (existing) {
            return {
              items: s.items.map((it) =>
                it.id === existing.id ? { ...it, qty: it.qty + qty } : it,
              ),
              isOpen: true,
            };
          }
          return {
            items: [...s.items, { ...item, qty }],
            isOpen: true,
          };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((it) => it.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: s.items
            .map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it))
            .filter((it) => it.qty > 0),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),
    }),
    {
      name: "emerson-cart-v1",
      partialize: (s) => ({ items: s.items }),
    },
  ),
);

export const parsePrice = (s: string): number => {
  // "R$ 100,00" -> 100
  const cleaned = s.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
};

export const formatBRL = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

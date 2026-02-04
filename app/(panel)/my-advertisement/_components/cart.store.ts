import { create } from "zustand";
import { Product } from "@/app/(panel)/my-add/services/response/addResponse";

export interface CartItem {
  id: string; // ✅ UUID
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string;
}

interface CartState {
  items: CartItem[];
  addProduct: (product: Product, quantity: number) => void;
  removeProduct: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],

  addProduct: (product, quantity) => {
    const productId = String(product.id); // ✅ UUID como string
    const items = get().items;

    const existing = items.find((i) => i.id === productId);

    if (existing) {
      set({
        items: items.map((i) =>
          i.id === productId
            ? {
                ...i,
                quantity: i.quantity + quantity,
                subtotal: (i.quantity + quantity) * i.price,
              }
            : i,
        ),
      });

      console.log("🟡 Producto actualizado:", product.name);
    } else {
      const newItem: CartItem = {
        id: productId,
        name: product.name,
        price: product.price,
        quantity,
        subtotal: product.price * quantity,
        image: product.files?.[0],
      };

      set({ items: [...items, newItem] });

      console.log("🟢 Producto agregado al carrito:", newItem);
    }
  },

  removeProduct: (id) => set({ items: get().items.filter((i) => i.id !== id) }),

  updateQuantity: (id, quantity) =>
    set({
      items: get().items.map((i) =>
        i.id === id ? { ...i, quantity, subtotal: i.price * quantity } : i,
      ),
    }),

  clearCart: () => set({ items: [] }),

  total: () => get().items.reduce((acc, i) => acc + i.subtotal, 0),
}));

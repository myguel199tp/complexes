import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@/app/(panel)/my-add/services/response/addResponse";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  image?: string;
  /** Cada línea recuerda de qué negocio salió: el pedido es por vendedor. */
  sellerId: string;
  sellerName: string;
}

/** Un pedido por negocio, que es como el backend acepta las órdenes. */
export interface CartGroup {
  sellerId: string;
  sellerName: string;
  items: CartItem[];
  total: number;
}

interface CartState {
  items: CartItem[];
  addProduct: (
    product: Product,
    quantity: number,
    seller: { id: string; name: string },
  ) => void;
  removeProduct: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  clearSeller: (sellerId: string) => void;
  total: () => number;
  /** Carrito partido por negocio, listo para mandar una orden por grupo. */
  groups: () => CartGroup[];
}

/**
 * El carrito se persiste en localStorage porque el checkout toma varios pasos
 * y perderlo al recargar era la forma más fácil de perder la venta.
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addProduct: (product, quantity, seller) => {
        const productId = String(product.id);
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
          return;
        }

        const price = Number(product.price) || 0;

        set({
          items: [
            ...items,
            {
              id: productId,
              name: product.name,
              price,
              quantity,
              subtotal: price * quantity,
              image: product.files?.[0],
              sellerId: seller.id,
              sellerName: seller.name,
            },
          ],
        });
      },

      removeProduct: (id) =>
        set({ items: get().items.filter((i) => i.id !== id) }),

      updateQuantity: (id, quantity) =>
        set({
          items: get()
            .items.map((i) =>
              i.id === id
                ? { ...i, quantity, subtotal: i.price * quantity }
                : i,
            )
            // Bajar a 0 equivale a quitar el producto.
            .filter((i) => i.quantity > 0),
        }),

      clearCart: () => set({ items: [] }),

      clearSeller: (sellerId) =>
        set({ items: get().items.filter((i) => i.sellerId !== sellerId) }),

      total: () => get().items.reduce((acc, i) => acc + i.subtotal, 0),

      groups: () => {
        const bySeller = new Map<string, CartGroup>();

        for (const item of get().items) {
          const group = bySeller.get(item.sellerId) ?? {
            sellerId: item.sellerId,
            sellerName: item.sellerName,
            items: [],
            total: 0,
          };

          group.items.push(item);
          group.total += item.subtotal;

          bySeller.set(item.sellerId, group);
        }

        return [...bySeller.values()];
      },
    }),
    {
      name: "marketplace-cart",
      storage: createJSONStorage(() => localStorage),
      // Solo persistimos datos; los métodos se recrean en cada arranque.
      partialize: (state) => ({ items: state.items }),
    },
  ),
);

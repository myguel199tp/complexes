"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { DataOrderServices } from "../../../services/orderService";
import { PaymentMethod } from "../../../services/request/orderRequest";
import { CartGroup, useCartStore } from "../../cart.store";

interface CheckoutContact {
  unitId?: string;
  message?: string;
  preferredPaymentMethod?: PaymentMethod;
  contactPhone?: string;
  contactEmail?: string;
}

export interface CheckoutPayload {
  groups: CartGroup[];
  contact: CheckoutContact;
}

const api = new DataOrderServices();

/**
 * Confirma el carrito: un pedido por negocio.
 *
 * Antes esta mutación evaluaba `response.ok` sobre el JSON ya parseado, que
 * siempre es `undefined`, así que hasta los pedidos creados con éxito
 * mostraban "algo salió mal". Ahora el éxito es que la promesa resuelva, y el
 * error trae el mensaje real del backend ("solo quedan 3 unidades", etc.).
 */
export function useMutationOrder() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const router = useRouter();
  const queryClient = useQueryClient();

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const clearCart = useCartStore((state) => state.clearCart);

  return useMutation({
    mutationFn: async ({ groups, contact }: CheckoutPayload) => {
      if (!conjuntoId) {
        throw new Error("No hay un conjunto seleccionado");
      }

      if (groups.length === 0) {
        throw new Error("Tu carrito está vacío");
      }

      // Secuencial y no en paralelo: si un negocio se queda sin stock queremos
      // saber cuál falló, en vez de perder el lote entero en un Promise.all.
      const created = [];

      for (const group of groups) {
        created.push(
          await api.addOrders(conjuntoId, {
            sellerId: group.sellerId,
            items: group.items.map((item) => ({
              productId: item.id,
              quantity: item.quantity,
            })),
            ...contact,
          }),
        );
      }

      return created;
    },

    onSuccess: (orders) => {
      clearCart();

      queryClient.invalidateQueries({ queryKey: ["my-purchases"] });

      showAlert(
        orders.length === 1
          ? "¡Pedido enviado! El vendedor debe confirmarlo."
          : `¡${orders.length} pedidos enviados! Cada negocio debe confirmar el suyo.`,
        "success",
      );

      router.push(route.myOrders);
    },

    onError: (error: Error) => {
      showAlert(error.message || "¡Error en el servidor!", "error");
    },
  });
}

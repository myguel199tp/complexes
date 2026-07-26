"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { DataOrderServices } from "@/app/(panel)/my-advertisement/services/orderService";
import { DataBookingServices } from "@/app/(panel)/my-advertisement/services/bookingService";
import {
  BookingStatus,
  OrderStatus,
} from "@/app/(panel)/my-advertisement/services/response/marketplaceResponse";
import { IRateSellerRequest } from "@/app/(panel)/my-advertisement/services/request/orderRequest";

const orderApi = new DataOrderServices();
const bookingApi = new DataBookingServices();

/** Lo que ve el comprador: sus pedidos y sus citas. */
export function useMyPurchases() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const orders = useQuery({
    queryKey: ["my-purchases", conjuntoId],
    queryFn: () => orderApi.myPurchases(conjuntoId),
    enabled: !!conjuntoId,
  });

  const bookings = useQuery({
    queryKey: ["my-bookings", conjuntoId],
    queryFn: () => bookingApi.myBookings(conjuntoId),
    enabled: !!conjuntoId,
  });

  return {
    orders: orders.data ?? [],
    bookings: bookings.data ?? [],
    isLoading: orders.isLoading || bookings.isLoading,
  };
}

/** Lo que ve el vendedor: los pedidos que recibió y su agenda de citas. */
export function useMySales() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const orders = useQuery({
    queryKey: ["my-sales", conjuntoId],
    queryFn: () => orderApi.mySales(conjuntoId),
    enabled: !!conjuntoId,
  });

  const bookings = useQuery({
    queryKey: ["my-agenda", conjuntoId],
    queryFn: () => bookingApi.myAgenda(conjuntoId),
    enabled: !!conjuntoId,
  });

  return {
    orders: orders.data ?? [],
    bookings: bookings.data ?? [],
    isLoading: orders.isLoading || bookings.isLoading,
  };
}

/**
 * Refresca las cuatro listas después de cualquier cambio de estado.
 *
 * Un mismo usuario puede ser comprador y vendedor a la vez —es lo normal entre
 * vecinos—, así que no vale la pena adivinar qué lista tocó: se invalidan
 * todas y react-query resuelve.
 */
function useInvalidateMarketplace() {
  const queryClient = useQueryClient();

  return () => {
    ["my-purchases", "my-sales", "my-bookings", "my-agenda"].forEach((key) =>
      queryClient.invalidateQueries({ queryKey: [key] }),
    );
  };
}

export function useOrderStatusMutation() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const invalidate = useInvalidateMarketplace();

  return useMutation({
    mutationFn: (vars: {
      id: string;
      status: OrderStatus;
      sellerMessage?: string;
      cancellationReason?: string;
    }) => orderApi.updateStatus(conjuntoId, vars.id, vars),

    onSuccess: () => {
      invalidate();
      showAlert("Pedido actualizado", "success");
    },

    onError: (error: Error) =>
      showAlert(error.message || "No se pudo actualizar", "error"),
  });
}

export function useBookingStatusMutation() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const invalidate = useInvalidateMarketplace();

  return useMutation({
    mutationFn: (vars: {
      id: string;
      status: BookingStatus;
      sellerMessage?: string;
      cancellationReason?: string;
    }) => bookingApi.updateStatus(conjuntoId, vars.id, vars),

    onSuccess: () => {
      invalidate();
      showAlert("Cita actualizada", "success");
    },

    onError: (error: Error) =>
      showAlert(error.message || "No se pudo actualizar", "error"),
  });
}

export function useRatingMutation() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const invalidate = useInvalidateMarketplace();

  return useMutation({
    mutationFn: (vars: {
      id: string;
      kind: "order" | "booking";
      body: IRateSellerRequest;
    }) =>
      vars.kind === "order"
        ? orderApi.rate(conjuntoId, vars.id, vars.body)
        : bookingApi.rate(conjuntoId, vars.id, vars.body),

    onSuccess: () => {
      invalidate();
      showAlert("¡Gracias por calificar!", "success");
    },

    onError: (error: Error) =>
      showAlert(error.message || "No se pudo calificar", "error"),
  });
}

"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Text } from "complexes-next-components";
import { ImSpinner9 } from "react-icons/im";

import { Button } from "@/app/components/ui/form";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  connectMercadoPago,
  disconnectMercadoPago,
  getMercadoPagoAccount,
  MercadoPagoAccountStatus,
} from "../../../services/mercadoPagoAccountService";

const QUERY_KEY = ["mercadopago-account"];

const RETURN_MESSAGES: Record<string, { text: string; type: "success" | "error" | "info" }> = {
  vinculada: {
    text: "Mercado Pago quedó vinculado: ya puedes recibir reservas pagadas en línea.",
    type: "success",
  },
  error: {
    text: "No pudimos vincular Mercado Pago. Intenta de nuevo.",
    type: "error",
  },
  cancelada: {
    text: "No se vinculó Mercado Pago: cancelaste la autorización.",
    type: "info",
  },
};

interface Props {
  /** Dentro de "Datos de pago": sin el aviso de la vuelta desde Mercado Pago. */
  compact?: boolean;
}

/**
 * La cuenta de Mercado Pago donde el anfitrión recibe el pago de las
 * reservas. Con el cobro en línea encendido es obligatoria: el huésped le
 * paga directo a esa cuenta y la plataforma solo recibe su comisión. Mientras
 * el cobro siga simulado la tarjeta no se muestra.
 */
export default function MercadoPagoLinkCard({ compact = false }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const { data, isLoading } = useQuery<MercadoPagoAccountStatus>({
    queryKey: QUERY_KEY,
    queryFn: getMercadoPagoAccount,
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Vuelta desde Mercado Pago (`?mercadopago=vinculada|error|cancelada`).
  const returned = searchParams.get("mercadopago");
  useEffect(() => {
    if (compact || !returned) return;

    const message = RETURN_MESSAGES[returned];
    if (message) showAlert(message.text, message.type);

    queryClient.invalidateQueries(QUERY_KEY);
    router.replace(pathname);
  }, [compact, returned, showAlert, queryClient, router, pathname]);

  const connect = useMutation({
    mutationFn: connectMercadoPago,
    onSuccess: ({ url }) => window.location.assign(url),
    onError: (err: Error) => showAlert(err.message, "error"),
  });

  const disconnect = useMutation({
    mutationFn: disconnectMercadoPago,
    onSuccess: () => {
      showAlert("Desvinculaste tu cuenta de Mercado Pago.", "info");
      queryClient.invalidateQueries(QUERY_KEY);
    },
    onError: (err: Error) => showAlert(err.message, "error"),
  });

  if (isLoading) {
    return compact ? null : (
      <div className="my-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
        <ImSpinner9 className="animate-spin" /> Consultando Mercado Pago…
      </div>
    );
  }

  if (!data || (data.cobroEnLinea !== "mercadopago" && !data.vinculada)) {
    return null;
  }

  const linked = data.vinculada;

  return (
    <div
      className={`my-3 rounded-xl border p-4 ${
        linked
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40"
          : "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Text size="sm" font="bold" className="text-gray-900 dark:text-gray-100">
            {linked
              ? "Mercado Pago vinculado"
              : data.volverAVincular
                ? "Vuelve a vincular Mercado Pago"
                : "Vincula tu cuenta de Mercado Pago"}
            {linked && data.modoPrueba && (
              <span className="ml-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                Prueba
              </span>
            )}
          </Text>
          <Text size="xs" className="mt-1 text-gray-700 dark:text-gray-300">
            {linked
              ? `El pago de cada reserva te llega directo a tu cuenta de Mercado Pago (${data.cuentaMercadoPago}), menos la comisión de la plataforma y la de Mercado Pago. Las devoluciones por cancelación salen de esa misma cuenta.`
              : data.volverAVincular
                ? "La autorización venció y no se pudo renovar. Mientras no la renueves, tus inmuebles no reciben reservas."
                : "Las reservas se pagan en línea con Mercado Pago y el dinero va directo a tu cuenta. Sin vincularla, tus inmuebles no se pueden reservar."}
          </Text>
        </div>

        {linked ? (
          <Button
            size="sm"
            colVariant="default"
            disabled={disconnect.isLoading}
            onClick={() => {
              if (
                window.confirm(
                  "¿Desvincular Mercado Pago? Tus inmuebles dejan de recibir reservas hasta que vuelvas a vincular.",
                )
              ) {
                disconnect.mutate();
              }
            }}
          >
            {disconnect.isLoading ? "Desvinculando…" : "Desvincular"}
          </Button>
        ) : (
          <Button
            size="sm"
            colVariant="success"
            disabled={connect.isLoading}
            onClick={() => connect.mutate()}
          >
            {connect.isLoading ? "Abriendo Mercado Pago…" : "Vincular Mercado Pago"}
          </Button>
        )}
      </div>
    </div>
  );
}

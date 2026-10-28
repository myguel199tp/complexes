"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Text } from "complexes-next-components";
import {
  getPublicRentalCharge,
  payPublicRentalCharge,
  type PublicRentalCharge,
  type RentalReceipt,
} from "./rental-payment.service";

const money = (value: number) => `$${(value || 0).toLocaleString("es-CO")}`;

/** "2026-11" → "noviembre de 2026". */
const formatPeriod = (period: string) => {
  const [year, month] = period.split("-").map(Number);
  if (!year || !month) return period;

  return new Date(Date.UTC(year, month - 1, 15)).toLocaleDateString("es-CO", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
};

/**
 * Pago del arriendo de una celda.
 *
 * Fuera del panel y sin sesión, como el cobro del visitante: el externo que
 * alquila una celda del conjunto no tiene cuenta en la app, y el link le llega
 * por correo cada mes. Al residente que alquila la celda de otro le llega el
 * mismo link. El token es lo que protege la pantalla.
 *
 * El pago hoy resuelve contra una pasarela simulada, y la pantalla lo dice de
 * frente en vez de fingir un recibo bancario que no existe.
 */
export default function RentalPaymentPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [charge, setCharge] = useState<PublicRentalCharge | null>(null);
  const [receipt, setReceipt] = useState<RentalReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    void (async () => {
      try {
        const data = await getPublicRentalCharge(token);
        if (!cancelled) setCharge(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Error inesperado");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handlePay = async () => {
    if (!token) return;

    setPaying(true);
    setError(null);

    try {
      setReceipt(await payPublicRentalCharge(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setPaying(false);
    }
  };

  const alreadyPaid = charge?.status === "PAID";
  const fee = (charge?.feeAmount ?? 0) + (charge?.taxAmount ?? 0);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        {loading && (
          <Text size="sm" className="text-center text-gray-500">
            Cargando el cobro...
          </Text>
        )}

        {!loading && error && !receipt && !charge && (
          <div className="text-center">
            <Text className="text-4xl">⚠️</Text>
            <Text size="sm" font="semi" className="mt-3 text-gray-800">
              {error}
            </Text>
          </div>
        )}

        {/* ── Recibo ── */}
        {receipt && (
          <div className="text-center">
            <Text className="text-5xl">✅</Text>
            <Text font="bold" className="mt-4 text-lg text-gray-800">
              {receipt.message}
            </Text>
            <Text font="bold" className="mt-4 text-3xl text-emerald-600">
              {money(receipt.total)}
            </Text>
            <Text size="sm" className="mt-1 text-gray-500">
              Celda {receipt.spotCode ?? ""} · {formatPeriod(receipt.period)}
            </Text>

            {receipt.simulated && (
              <Text
                size="xs"
                colVariant="warning"
                className="mt-4 rounded-md bg-amber-50 p-2"
              >
                Pago de prueba: la pasarela todavía no está conectada.
              </Text>
            )}
          </div>
        )}

        {/* ── Cobro ── */}
        {!loading && charge && !receipt && (
          <>
            <Text size="sm" className="text-center text-gray-500">
              {charge.conjunto}
            </Text>
            <Text
              as="h1"
              size="md"
              font="bold"
              className="mt-1 text-center text-gray-800"
            >
              Arriendo de parqueadero
            </Text>
            <Text size="sm" className="mt-1 text-center text-gray-500">
              Celda {charge.spotCode ?? ""} · {formatPeriod(charge.period)}
            </Text>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">
                  {charge.payee === "RESIDENT"
                    ? "Canon (para el dueño)"
                    : "Canon (para el conjunto)"}
                </span>
                <span className="font-semibold">{money(charge.canon)}</span>
              </div>
              {fee > 0 && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">
                    Cargo por servicio (con IVA)
                  </span>
                  <span className="font-semibold">{money(fee)}</span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Vence</span>
                <span className="font-semibold">{charge.dueDate}</span>
              </div>
            </div>

            <Text size="sm" className="mt-6 text-center text-gray-500">
              Total
            </Text>
            <Text font="bold" className="text-center text-4xl text-gray-800">
              {money(charge.total)}
            </Text>

            {error && (
              <Text
                size="sm"
                colVariant="danger"
                className="mt-4 rounded-md bg-red-50 p-3 text-center"
              >
                {error}
              </Text>
            )}

            {alreadyPaid ? (
              <Text
                size="sm"
                font="semi"
                className="mt-6 rounded-lg bg-emerald-50 p-3 text-center text-emerald-700"
              >
                Este mes ya está pagado
              </Text>
            ) : (
              <button
                onClick={handlePay}
                disabled={paying}
                className="mt-6 w-full rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {paying ? "Procesando..." : "Pagar"}
              </button>
            )}

            {charge.simulated && !alreadyPaid && (
              <Text
                size="xs"
                colVariant="warning"
                className="mt-4 rounded-md bg-amber-50 p-2 text-center"
              >
                Pago simulado: la pasarela todavía no está conectada.
              </Text>
            )}
          </>
        )}
      </div>
    </main>
  );
}

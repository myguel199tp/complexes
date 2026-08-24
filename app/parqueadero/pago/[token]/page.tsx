"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Text } from "complexes-next-components";
import {
  getPublicCheckout,
  payPublicCheckout,
  type CheckoutReceipt,
  type PublicCheckout,
} from "./parking-checkout.service";

const money = (value: number) => `$${(value || 0).toLocaleString("es-CO")}`;

const formatDuration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

/**
 * Pantalla de pago del visitante.
 *
 * Se abre escaneando el QR que muestra el celador. Va fuera del panel y sin
 * sesión a propósito: quien la abre es alguien que solo vino de visita, y
 * pedirle registrarse para poder sacar el carro sería pedirle una cuenta en una
 * app que no va a volver a usar. El token del QR es lo que la protege.
 *
 * El pago hoy resuelve contra una pasarela simulada, y la pantalla lo dice de
 * frente en vez de fingir un recibo bancario que no existe.
 */
export default function ParkingCheckoutPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [checkout, setCheckout] = useState<PublicCheckout | null>(null);
  const [receipt, setReceipt] = useState<CheckoutReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    void (async () => {
      try {
        const data = await getPublicCheckout(token);
        if (!cancelled) setCheckout(data);
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
      setReceipt(await payPublicCheckout(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setPaying(false);
    }
  };

  const alreadyPaid = checkout?.paymentStatus === "PAID";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        {loading && (
          <Text size="sm" className="text-center text-gray-500">Cargando el cobro...</Text>
        )}

        {!loading && error && !receipt && (
          <div className="text-center">
            <Text className="text-4xl">⚠️</Text>
            <Text size="sm" font="semi" className="mt-3 text-gray-800">{error}</Text>
            <Text size="sm" className="mt-2 text-gray-500">
              Pídele al vigilante que genere el código otra vez.
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
              {money(receipt.amount)}
            </Text>
            {receipt.plaque && (
              <Text size="sm" className="mt-1 text-gray-500">Placa {receipt.plaque}</Text>
            )}
            <Text size="sm" className="mt-4 text-gray-500">
              Muéstrale esta pantalla al vigilante.
            </Text>

            {receipt.simulated && (
              <Text size="xs" colVariant="warning" className="mt-4 rounded-md bg-amber-50 p-2">
                Pago de prueba: la pasarela todavía no está conectada.
              </Text>
            )}
          </div>
        )}

        {/* ── Cobro ── */}
        {!loading && checkout && !receipt && (
          <>
            <Text size="sm" className="text-center text-gray-500">
              {checkout.conjunto}
            </Text>
            <Text as="h1" size="md" font="bold" className="mt-1 text-center text-gray-800">
              Parqueadero de visitantes
            </Text>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Placa</span>
                <span className="font-semibold">{checkout.plaque ?? "—"}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Tiempo</span>
                <span className="font-semibold">
                  {formatDuration(checkout.durationMinutes)}
                </span>
              </div>
            </div>

            <Text size="sm" className="mt-6 text-center text-gray-500">Total</Text>
            <Text font="bold" className="text-center text-4xl text-gray-800">
              {money(checkout.amount)}
            </Text>

            {error && (
              <Text size="sm" colVariant="danger" className="mt-4 rounded-md bg-red-50 p-3 text-center">
                {error}
              </Text>
            )}

            {alreadyPaid ? (
              <Text size="sm" font="semi" className="mt-6 rounded-lg bg-emerald-50 p-3 text-center text-emerald-700">
                Este cobro ya está pagado
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

            {checkout.simulated && !alreadyPaid && (
              <Text size="xs" colVariant="warning" className="mt-4 rounded-md bg-amber-50 p-2 text-center">
                Pago simulado: la pasarela todavía no está conectada.
              </Text>
            )}
          </>
        )}
      </div>
    </main>
  );
}

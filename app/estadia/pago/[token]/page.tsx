"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Text } from "complexes-next-components";
import {
  getPublicStayCheckout,
  payPublicStayCheckout,
  type PublicStayCheckout,
  type StayCheckoutReceipt,
} from "./stay-checkout.service";

const money = (value: number) => `$${(value || 0).toLocaleString("es-CO")}`;

const formatDate = (value: string) =>
  value ? new Date(`${value}T00:00:00`).toLocaleDateString("es-CO") : "—";

const platformLabel: Record<string, string> = {
  AIRBNB: "Airbnb",
  BOOKING: "Booking",
  VRBO: "VRBO",
};

/**
 * Pantalla de pago del huésped que llegó por una plataforma externa.
 *
 * Se abre escaneando el QR que le muestra el celador en la reja. Va fuera del
 * panel y sin sesión a propósito: quien la abre reservó en Airbnb y no tiene
 * cuenta aquí. Pedirle registrarse para poder entrar sería el problema que esta
 * pantalla existe para resolver — la cuenta se la crea el pago, no un formulario.
 *
 * Por eso el recibo es distinto al del parqueadero: además de confirmar la plata
 * entrega las credenciales. Se muestran una sola vez, así que la pantalla insiste
 * en que las guarde.
 */
export default function StayCheckoutPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;

  const [checkout, setCheckout] = useState<PublicStayCheckout | null>(null);
  const [receipt, setReceipt] = useState<StayCheckoutReceipt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    void (async () => {
      try {
        const data = await getPublicStayCheckout(token);
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
      setReceipt(await payPublicStayCheckout(token));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setPaying(false);
    }
  };

  const alreadySettled =
    checkout?.status === "PAID" ||
    checkout?.status === "REVIEW" ||
    checkout?.status === "FREE";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        {loading && (
          <Text size="sm" className="text-center text-gray-500">
            Cargando el cobro...
          </Text>
        )}

        {!loading && error && !receipt && (
          <div className="text-center">
            <Text className="text-4xl">⚠️</Text>
            <Text size="sm" font="semi" className="mt-3 text-gray-800">
              {error}
            </Text>
            <Text size="sm" className="mt-2 text-gray-500">
              Pídele al vigilante que genere el código otra vez.
            </Text>
          </div>
        )}

        {/* ── Recibo y credenciales ── */}
        {receipt && (
          <div className="text-center">
            <Text className="text-5xl">✅</Text>
            <Text font="bold" className="mt-4 text-lg text-gray-800">
              {receipt.message}
            </Text>
            <Text font="bold" className="mt-4 text-3xl text-emerald-600">
              {money(receipt.amount)}
            </Text>

            {receipt.cuenta && (
              <div className="mt-6 rounded-xl bg-gray-50 p-4 text-left">
                <Text size="sm" font="bold" className="text-gray-800">
                  Tu acceso a la aplicación
                </Text>
                <Text size="xs" className="mt-1 text-gray-500">
                  Guárdalo: esta clave no se vuelve a mostrar.
                </Text>

                <div className="mt-3 flex justify-between py-1">
                  <span className="text-gray-500">Correo</span>
                  <span className="font-semibold break-all">
                    {receipt.cuenta.email}
                  </span>
                </div>

                {receipt.cuenta.tempPassword ? (
                  <div className="mt-1 flex justify-between py-1">
                    <span className="text-gray-500">Clave temporal</span>
                    <span className="font-mono font-bold tracking-widest">
                      {receipt.cuenta.tempPassword}
                    </span>
                  </div>
                ) : (
                  <Text size="xs" className="mt-2 text-gray-500">
                    Ya tenías cuenta con este correo: entra con tu contraseña de
                    siempre.
                  </Text>
                )}

                <div className="mt-1 flex justify-between py-1">
                  <span className="text-gray-500">Apartamento</span>
                  <span className="font-semibold">
                    {receipt.cuenta.torre ? `${receipt.cuenta.torre} · ` : ""}
                    {receipt.cuenta.apartamento ?? "—"}
                  </span>
                </div>

                <div className="mt-1 flex justify-between py-1">
                  <span className="text-gray-500">Vigencia</span>
                  <span className="font-semibold">
                    {formatDate(receipt.cuenta.desde)} →{" "}
                    {formatDate(receipt.cuenta.hasta)}
                  </span>
                </div>
              </div>
            )}

            <Text size="sm" className="mt-4 text-gray-500">
              Muéstrale esta pantalla al vigilante para que te deje entrar.
            </Text>

            <Text
              size="xs"
              colVariant="warning"
              className="mt-4 rounded-md bg-amber-50 p-2"
            >
              Pago de prueba: la pasarela todavía no está conectada.
            </Text>
          </div>
        )}

        {/* ── Cobro ── */}
        {!loading && checkout && !receipt && (
          <>
            <Text size="sm" className="text-center text-gray-500">
              {checkout.conjunto}
            </Text>
            <Text
              as="h1"
              size="md"
              font="bold"
              className="mt-1 text-center text-gray-800"
            >
              Acceso de huésped
            </Text>

            <div className="mt-6 rounded-xl bg-gray-50 p-4">
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Huésped</span>
                <span className="font-semibold">{checkout.guestName}</span>
              </div>
              {checkout.plataforma && (
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Plataforma</span>
                  <span className="font-semibold">
                    {platformLabel[checkout.plataforma] ?? checkout.plataforma}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1">
                <span className="text-gray-500">Estadía</span>
                <span className="font-semibold">
                  {formatDate(checkout.entrada)} → {formatDate(checkout.salida)}
                </span>
              </div>
            </div>

            <Text size="sm" className="mt-6 text-center text-gray-500">
              Total
            </Text>
            <Text font="bold" className="text-center text-4xl text-gray-800">
              {money(checkout.amount)}
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

            {alreadySettled ? (
              <Text
                size="sm"
                font="semi"
                className="mt-6 rounded-lg bg-emerald-50 p-3 text-center text-emerald-700"
              >
                Este acceso ya está pagado
              </Text>
            ) : (
              <button
                onClick={handlePay}
                disabled={paying}
                className="mt-6 w-full rounded-xl bg-emerald-600 py-4 text-lg font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {paying ? "Procesando..." : "Pagar y entrar"}
              </button>
            )}

            {checkout.simulated && !alreadySettled && (
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

/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { createPayment } from "./services/payment";
import { Avatar, Tooltip, Text } from "complexes-next-components";
import { planFeatures } from "../registers/_components/register-complex/plans-features";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

type Plan = "basic" | "gold" | "platinum";

const PRICES: Record<Plan, number> = {
  basic: 30000,
  gold: 50000,
  platinum: 80000,
};

export default function PaymentPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan: Plan = "gold";
  const amount = PRICES[plan];
  const currency = "COP";

  const { t } = useTranslation();
  const { language } = useLanguage();

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      const payment = await createPayment({
        user_id: "USER_ID",
        conjunto_id: "CONJUNTO_ID",
        country: "CO",
        amount,
        currency,
        reference: `PAY-${Date.now()}`,
      });

      if (payment.provider === "STRIPE") {
        window.location.href = payment.provider_response.url;
      }

      if (payment.provider === "DLOCAL") {
        window.location.href = payment.provider_response.redirect_url;
      }
    } catch {
      setError("No pudimos iniciar el pago. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      key={language}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4"
    >
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* LEFT – INFO */}
        <div className="p-8 md:p-10 bg-gray-900 text-white">
          <div className="mb-8">
            <div className="flex gap-4 items-center">
              <Avatar
                src="/complex.jpg"
                alt="complex"
                size="md"
                border="thick"
                shape="rounded"
              />
              <div>
                <h1 className="text-3xl font-semibold leading-tight">
                  Activa tu conjunto
                </h1>
                <p className="text-sm text-gray-300">
                  Plan {plan.toUpperCase()}
                </p>
              </div>
            </div>

            <p className="text-gray-300 mt-3 text-sm">
              Estas son las funcionalidades de tu plan
            </p>
          </div>

          {/* FEATURES */}
          <ul className="mt-4 space-y-2 text-sm">
            {planFeatures[plan].map((featureKey) => {
              const baseKey = `plans_features.${plan}.${featureKey}`;

              const text = t(`${baseKey}.text`);
              const tooltip = t(`${baseKey}.tooltip`, {
                defaultValue: t("sinDescripcion"),
              });

              const tachado =
                t(`${baseKey}.tachado`, {
                  defaultValue: "false",
                }) === "true";

              return (
                <li key={featureKey} className="flex items-start gap-2">
                  <span className="mt-1 text-green-400">✔</span>

                  <Tooltip content={tooltip}>
                    <Text
                      size="sm"
                      className={
                        tachado ? "line-through text-gray-500" : "text-gray-100"
                      }
                    >
                      {text}
                    </Text>
                  </Tooltip>
                </li>
              );
            })}
          </ul>

          <div className="mt-10 text-xs text-gray-400">
            Pago seguro procesado por Stripe o DLocal.
          </div>
        </div>

        {/* RIGHT – CHECKOUT */}
        <section className="flex items-center justify-center">
          <div className="p-8 md:p-10 w-full">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Resumen del pago
            </h2>

            <div className="border rounded-xl p-5 mb-6">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">Plan</span>
                <span className="text-sm font-medium capitalize">{plan}</span>
              </div>

              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">Duración</span>
                <span className="text-sm font-medium">30 días</span>
              </div>

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-gray-900 font-medium">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {currency} {amount.toLocaleString()}
                </span>
              </div>
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            {/* PAY BUTTON */}
            <button
              onClick={handlePay}
              disabled={loading}
              className="w-full h-12 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Procesando pago…
                </>
              ) : (
                "Pagar y activar"
              )}
            </button>

            {/* PAYMENT METHODS */}
            <div className="mt-5 text-center">
              <p className="text-xs text-gray-500 mb-3">
                Medios de pago disponibles
              </p>

              <div className="flex justify-center items-center gap-4 flex-wrap">
                <img
                  src="/payments/visa.svg"
                  alt="Visa"
                  className="h-6 opacity-80"
                />
                <img
                  src="/payments/mastercard.svg"
                  alt="Mastercard"
                  className="h-6 opacity-80"
                />
                <img
                  src="/payments/amex.svg"
                  alt="American Express"
                  className="h-6 opacity-80"
                />
                <img
                  src="/payments/pse.svg"
                  alt="PSE"
                  className="h-7 opacity-90"
                />
              </div>

              <p className="text-[11px] text-gray-400 mt-3">
                Pagos procesados por Stripe o DLocal · Tarjeta y PSE
              </p>
            </div>

            <p className="text-xs text-gray-400 text-center mt-6">
              Al continuar aceptas nuestros términos y condiciones.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

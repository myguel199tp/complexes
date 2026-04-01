/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Avatar, Text, Button, Title } from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useConjuntoStore } from "../../ensemble/components/use-store";
import { createPayment } from "../services/payment";
import { planFeatures } from "../../registers/_components/register-complex/plans-features";
import { usePaymentQuery } from "./payment-info-query";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useSimulatePayment } from "./useSimulatePayment";
import { useCountryCityOptions } from "../../registers/_components/register-option";

type Plan = "basic" | "gold" | "platinum";

const SIMULATE_PAYMENT = true;

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data } = usePaymentQuery();
  const router = useRouter();

  const plan = data?.plan as Plan;
  const amount = data?.prices ?? 0;
  const currency = data?.currency ?? "";

  const { t } = useTranslation();
  const { language } = useLanguage();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [iduser, setIduser] = useState<string>("");

  const { countryOptions, data: datacountry } = useCountryCityOptions();

  const countryUser =
    countryOptions.find((c) => c.value === String(data?.country))?.label ||
    data?.country;

  const cityUser =
    datacountry
      ?.find((c) => String(c.ids) === String(data?.country))
      ?.city?.find((c) => String(c.id) === String(data?.city))?.name ||
    data?.city;

  const simulatePaymentMutation = useSimulatePayment(String(conjuntoId));
  let formattedDate = "";

  if (data?.lastPaymentDate) {
    const nextPaymentDate = new Date(data.lastPaymentDate);

    if (!isNaN(nextPaymentDate.getTime())) {
      nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
      formattedDate = nextPaymentDate.toISOString().split("T")[0];
    }
  }

  const plans: Plan[] = ["basic", "gold", "platinum"];

  const otherPlans = plans.filter((p) => p !== plan);
  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      if (SIMULATE_PAYMENT) {
        await simulatePaymentMutation.mutateAsync({
          amount,
          currency,
          plan,
        });

        return;
      }

      const payment = await createPayment({
        user_id: iduser,
        conjuntoId: String(conjuntoId),
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

  useEffect(() => {
    const payload = getTokenPayload();
    setIduser(String(payload?.id ?? ""));
  }, []);

  return (
    <div
      key={language}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4"
    >
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="p-8 md:p-10 bg-gray-900 text-white">
          <div className="mb-8">
            <div className="flex gap-4 items-center">
              <div className="bg-white/20 p-2 rounded-full cursor-pointer">
                <IoReturnDownBackOutline
                  size={30}
                  color="white"
                  className="cursor-pointer"
                  onClick={() => router.push(route.myprofile)}
                />
              </div>

              <Avatar
                src="/complex.png"
                alt="complex"
                size="md"
                border="thick"
                shape="rounded"
              />
              <div>
                <Title as="h2" size="xs" font="semi">
                  {data?.name} Activate
                </Title>
                <Text size="sm" colVariant="on" font="semi">
                  Plan {plan?.toUpperCase()}
                </Text>
              </div>
            </div>

            <Text size="sm" colVariant="on" className="mt-3">
              Estas son las funcionalidades de tu plan
            </Text>
          </div>

          <ul className="mt-4 space-y-2 text-sm">
            {planFeatures[plan]?.map((featureKey) => {
              const baseKey = `plans_features.${plan}.${featureKey}`;

              const text = t(`${baseKey}.text`);

              const tachado =
                t(`${baseKey}.tachado`, {
                  defaultValue: "false",
                }) === "true";

              return (
                <li key={featureKey} className="flex items-start gap-2">
                  <span className="mt-1 text-green-400">✔</span>

                  <Text
                    size="sm"
                    className={
                      tachado ? "line-through text-gray-500" : "text-gray-100"
                    }
                  >
                    {text}
                  </Text>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherPlans.map((p) => (
              <div
                key={p}
                className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition"
              >
                <Text size="sm" font="semi">
                  Plan {p.toUpperCase()}
                </Text>

                <Text size="xs" colVariant="on">
                  Cambiar a este plan
                </Text>

                <Button
                  size="sm"
                  colVariant="warning"
                  className="mt-2"
                  onClick={() => console.log("Cambiar a", p)}
                >
                  Cambiar plan
                </Button>
              </div>
            ))}
          </div>
        </div>

        <section className="flex items-center justify-center">
          <div className="p-8 md:p-10 w-full">
            <Title as="h3" size="sm" font="semi" className="mb-6">
              Resumen del pago
            </Title>

            <div className="border rounded-xl p-5 mb-6">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">Nombre</span>
                <span className="text-sm font-medium capitalize">
                  {data?.name}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">Dirección</span>
                <span className="text-sm font-medium capitalize">
                  {data?.address}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">País</span>
                <span className="text-sm font-medium capitalize">
                  {countryUser}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">Ciudad</span>
                <span className="text-sm font-medium capitalize">
                  {cityUser}
                </span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">Sector</span>
                <span className="text-sm font-medium capitalize">
                  {data?.neighborhood}
                </span>
              </div>

              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">Plan</span>
                <span className="text-sm font-medium capitalize">{plan}</span>
              </div>

              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">Último pago</span>
                <span className="text-sm font-medium">
                  {String(data?.lastPaymentDate) ?? ""}
                </span>
              </div>

              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">Siguiente pago</span>
                <span className="text-sm font-medium">
                  {formattedDate ?? ""}
                </span>
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

            <Button
              onClick={handlePay}
              disabled={
                loading ||
                simulatePaymentMutation.isPending ||
                data?.isActive === true
              }
              colVariant="success"
              size="full"
            >
              {loading || simulatePaymentMutation.isPending
                ? "Procesando pago…"
                : "Pagar y activar"}
            </Button>

            <div className="flex justify-center items-center gap-4 mt-2 flex-wrap">
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

            {SIMULATE_PAYMENT && (
              <Text className="text-xs text-yellow-600 text-center mt-4">
                ⚠️ Modo simulación activo (no se realiza ningún cobro)
              </Text>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

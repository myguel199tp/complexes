/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";
import { Avatar, Text, Button, Title } from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useTokenPayload } from "@/app/components/session-provider";
import { useConjuntoStore } from "../../ensemble/components/use-store";
import { createPayment } from "../services/payment";
import { planFeatures } from "../../registers/_components/register-complex/plans-features";
import { usePaymentQuery } from "./payment-info-query";
import { IoReturnDownBackOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import { useSimulatePayment } from "./useSimulatePayment";
import { useUpgradePlan, useUpgradeQuote } from "./useUpgradePlan";
import { useCountryCityOptions } from "../../registers/_components/register-option";

type Plan = "basic" | "gold" | "platinum";

const SIMULATE_PAYMENT = true;

/**
 * Tarjeta de mejora de plan. Antes de confirmar muestra el desglose que
 * calcula el servidor: el tiempo del plan actual que aún no se consume se
 * abona, así que mejorar a mitad de un plan anual no bota lo ya pagado.
 */
function UpgradePlanCard({
  conjuntoId,
  plan,
  isPending,
  onUpgrade,
}: {
  conjuntoId: string;
  plan: "gold" | "platinum";
  isPending: boolean;
  onUpgrade: () => void;
}) {
  const { data: quote, isLoading } = useUpgradeQuote(conjuntoId, plan);

  const money = (value: number) =>
    `${value.toLocaleString("es-CO")} ${quote?.currency ?? ""}`.trim();

  // Un conjunto que todavía no ha pagado no tiene periodo que abonar: el
  // servidor devuelve creditAmount 0 y cobra el plan completo, así que el
  // desglose del prorrateo sobra y sólo se muestra el precio.
  const hasCredit = (quote?.creditAmount ?? 0) > 0;

  return (
    <div className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition">
      <Text size="sm" font="semi">
        Plan {plan.toUpperCase()}
      </Text>

      <Text
        size="sm"
        colVariant="on"
        className="font-semibold flex items-center gap-1 mt-1"
      >
        🚀 Mejora tu plan y obtén más beneficios
      </Text>

      {isLoading && (
        <Text size="sm" className="mt-2 opacity-80">
          {hasCredit ? "Calculando tu abono…" : "Calculando el precio…"}
        </Text>
      )}

      {quote && (
        <div className="mt-3 space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="opacity-80">Valor del plan</span>
            <span>{money(quote.newAmount)}</span>
          </div>
          {hasCredit && (
            <>
              <div className="flex justify-between text-green-400">
                <span>Abono por {quote.unusedDays} día(s) que ya pagaste</span>
                <span>-{money(quote.creditAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold border-t border-white/20 pt-1">
                <span>Pagas hoy</span>
                <span>{money(quote.chargedAmount)}</span>
              </div>
            </>
          )}
        </div>
      )}

      <Button
        size="md"
        colVariant="success"
        className="mt-3"
        disabled={isPending || isLoading}
        onClick={onUpgrade}
      >
        {isPending
          ? "Mejorando…"
          : hasCredit
            ? "Mejorar plan"
            : `Subir a ${plan.toUpperCase()}`}
      </Button>
    </div>
  );
}

export default function Payment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data } = usePaymentQuery();
  const router = useRouter();
  const payload = useTokenPayload();

  // Mejorar el plan genera un cargo y el backend lo restringe al empleado del
  // conjunto: al resto no se le ofrece la opción, en vez de dejarlo chocar con
  // un 403 al confirmar.
  const canUpgrade = payload?.roles?.includes("employee") ?? false;

  const plan = data?.plan as Plan;
  const amount = data?.prices ?? 0;
  const currency = data?.currency ?? "";

  const { t } = useTranslation();
  const { language } = useLanguage();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const [iduser, setIduser] = useState<string>("");

  const { data: datacountry } = useCountryCityOptions();

  /**
   * El conjunto guarda el país como código ISO ("CO"), pero los conjuntos
   * registrados antes de ese cambio lo tienen como `ids` numérico. Resolvemos
   * por ambos (y por nombre) para mostrar siempre el nombre del país.
   */
  const storedCountry = String(data?.country ?? "");
  const countryMatch = datacountry?.find(
    (c) =>
      String(c.code).toUpperCase() === storedCountry.toUpperCase() ||
      String(c.ids) === storedCountry,
  );

  const countryUser = countryMatch?.country || data?.country;

  const cityUser =
    countryMatch?.city?.find((c) => String(c.id) === String(data?.city))
      ?.name || data?.city;

  const simulatePaymentMutation = useSimulatePayment(String(conjuntoId));
  const upgradePlanMutation = useUpgradePlan(String(conjuntoId));
  let formattedDate = "";

  if (data?.lastPaymentDate && data?.billingPeriod) {
    const lastPayment = new Date(data.lastPaymentDate);

    if (!isNaN(lastPayment.getTime())) {
      const nextPayment = new Date(lastPayment);

      // Ajustamos según billingPeriod
      switch (data.billingPeriod) {
        case "mensual":
          nextPayment.setMonth(nextPayment.getMonth() + 1);
          break;
        case "semestral":
          nextPayment.setMonth(nextPayment.getMonth() + 6);
          break;
        case "anual":
          nextPayment.setFullYear(nextPayment.getFullYear() + 1);
          break;
        default:
          nextPayment.setMonth(nextPayment.getMonth() + 1);
      }

      formattedDate = nextPayment.toISOString().split("T")[0];
    }
  }

  const planUpgrades: Record<Plan, Plan[]> = {
    basic: ["gold", "platinum"],
    gold: ["platinum"],
    platinum: [],
  };

  const upgradePlans = planUpgrades[plan] ?? [];
  const billingPeriod = data?.billingPeriod;
  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      if (SIMULATE_PAYMENT) {
        await simulatePaymentMutation?.mutateAsync({
          amount,
          currency,
          plan,
          billingPeriod,
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
    setIduser(String(payload?.id ?? ""));
  }, [payload]);

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
                src="/icon.png"
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

              return (
                <li key={featureKey} className="flex items-start gap-2">
                  <span className="mt-1 text-green-400">✔</span>

                  {text}
                </li>
              );
            })}
          </ul>
          {/* La tarjeta se muestra aunque el conjunto todavía no haya pagado:
              en ese caso no hay abono y se cobra el plan completo. */}
          {canUpgrade && (
            <div className="mt-6">
              {upgradePlans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upgradePlans.map((p) => (
                    <UpgradePlanCard
                      key={p}
                      conjuntoId={String(conjuntoId)}
                      plan={p as "gold" | "platinum"}
                      isPending={upgradePlanMutation.isPending}
                      onUpgrade={() =>
                        upgradePlanMutation.mutate({
                          plan: p as "gold" | "platinum",
                        })
                      }
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-green-500/10 border border-green-400/30 rounded-xl p-4 text-center">
                  <Text size="sm" className="text-green-400 font-semibold">
                    🚀 Estás en el mejor plan disponible
                  </Text>
                </div>
              )}
            </div>
          )}
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

              {data?.lastPaymentDate !== null ? (
                <>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-gray-500">Último pago</span>
                    <span className="text-sm font-medium">
                      {String(data?.lastPaymentDate) ?? ""}
                    </span>
                  </div>
                  <div className="flex justify-between mb-3">
                    <span className="text-sm text-gray-500">
                      Siguiente pago
                    </span>
                    <span className="text-sm font-medium">
                      {formattedDate ?? ""}
                    </span>
                  </div>
                </>
              ) : null}

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

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
  const hasTimeCredit = (quote?.creditAmount ?? 0) > 0;
  const depositCredit = quote?.depositCreditAmount ?? 0;
  const hasCredit = hasTimeCredit || depositCredit > 0;

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
              {hasTimeCredit && (
                <div className="flex justify-between text-green-400">
                  <span>Abono por {quote.unusedDays} día(s) que ya pagaste</span>
                  <span>-{money(quote.creditAmount)}</span>
                </div>
              )}
              {depositCredit > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Abono de tu depósito</span>
                  <span>-{money(depositCredit)}</span>
                </div>
              )}
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

  // Lo que se cobra lo calcula el servidor: en el básico de los conjuntos
  // pequeños es la licencia de pago único, no el 0 del plan.
  const checkout = data?.checkout ?? null;
  const licenseOffer = data?.basicLicenseOffer ?? null;
  const [addLicense, setAddLicense] = useState(false);

  /** Oro o platino sin licencia: la pueden sumar al pago como opcional. */
  const canAddLicense = checkout?.concept === "PLAN" && !!licenseOffer;
  const withLicense = canAddLicense && addLicense;

  /** El básico de pago único: lo que se paga es la licencia. */
  const paysLicense =
    checkout?.concept === "LICENSE" && (checkout?.amount ?? 0) > 0;

  const amount =
    (checkout?.amount ?? data?.prices ?? 0) +
    (withLicense ? (licenseOffer?.total ?? 0) : 0);
  const currency = checkout?.currency ?? data?.currency ?? "";

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

  /** Año de historial completo del básico de por vida, si le toca. */
  const historyOffer = data?.history?.offer ?? null;

  /**
   * `basicLicense: "only"` paga sólo la licencia del básico: con oro o platino
   * vigente no toca el periodo; sin periodo vigente deja al conjunto en el
   * básico. `basicHistory` paga sólo un año de historial.
   */
  const handlePay = async (
    options: { basicLicense?: "add" | "only"; basicHistory?: boolean } = {},
  ) => {
    const { basicLicense, basicHistory } = options;

    setLoading(true);
    setError(null);

    const charged = basicHistory
      ? (historyOffer?.total ?? 0)
      : basicLicense === "only"
        ? (licenseOffer?.total ?? 0)
        : amount;

    try {
      if (SIMULATE_PAYMENT) {
        await simulatePaymentMutation?.mutateAsync({
          amount: charged,
          currency,
          plan,
          billingPeriod,
          basicLicense,
          basicHistory,
        });

        return;
      }

      const payment = await createPayment({
        user_id: iduser,
        conjuntoId: String(conjuntoId),
        country: "CO",
        amount: charged,
        currency,
        reference: `PAY-${Date.now()}`,
        basicLicense,
        basicHistory,
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

          {/* Oro o platino vigente sin licencia: comprarla sola no toca el
              periodo pagado, sólo cambia qué pasa si no renueva. */}
          {licenseOffer && plan !== "basic" && data?.isActive && (
            <div className="mt-6 bg-white/10 border border-white/20 rounded-xl p-4">
              <Text size="sm" font="semi">
                ♾️ Licencia del básico de por vida
              </Text>
              <Text size="sm" colVariant="on" className="mt-1 opacity-90">
                Si un día no renuevas {plan?.toUpperCase()}, tu conjunto pasa
                a Básico en vez de perder el acceso. Pago único de{" "}
                {licenseOffer.currency} {licenseOffer.total.toLocaleString()}{" "}
                (IVA incluido).
              </Text>
              <Button
                size="md"
                colVariant="success"
                className="mt-3"
                disabled={loading || simulatePaymentMutation.isPending}
                onClick={() => handlePay({ basicLicense: "only" })}
              >
                Comprar licencia
              </Button>
            </div>
          )}

          {/* Básico de por vida: el anual conserva todo el historial. Vencido
              solo se ven los últimos meses; nada se borra. */}
          {historyOffer && (
            <div className="mt-6 bg-white/10 border border-white/20 rounded-xl p-4">
              <Text size="sm" font="semi">
                🗂️ Historial anual
              </Text>
              <Text size="sm" colVariant="on" className="mt-1 opacity-90">
                {data?.history?.visibleSince
                  ? `Estás viendo solo los últimos ${data.history.months} meses. Lo anterior sigue guardado y vuelve a aparecer al pagar.`
                  : historyOffer.paidUntil
                    ? `Tu historial completo está pagado hasta el ${new Date(historyOffer.paidUntil).toLocaleDateString("es-CO")}. Puedes pagar el siguiente año por adelantado.`
                    : "Conserva a la vista todo el historial de tu conjunto."}{" "}
                {historyOffer.currency} {historyOffer.total.toLocaleString()}{" "}
                al año (IVA incluido).
              </Text>
              <Button
                size="md"
                colVariant="success"
                className="mt-3"
                disabled={loading || simulatePaymentMutation.isPending}
                onClick={() => handlePay({ basicHistory: true })}
              >
                Pagar historial
              </Button>
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
                      {data?.lifetimeBasic
                        ? "Básico de por vida"
                        : (formattedDate ?? "")}
                    </span>
                  </div>
                </>
              ) : null}

              {canAddLicense && licenseOffer && (
                <label className="mb-4 flex items-start gap-2 text-sm text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mt-1"
                    checked={addLicense}
                    onChange={(e) => setAddLicense(e.target.checked)}
                  />
                  <span>
                    Agregar la licencia del básico de por vida (+{" "}
                    {licenseOffer.currency}{" "}
                    {licenseOffer.total.toLocaleString()}, pago único). Si un
                    día no renuevas, tu conjunto pasa a Básico en vez de perder
                    el acceso.
                  </span>
                </label>
              )}

              <div className="border-t pt-4 flex justify-between items-center">
                <span className="text-gray-900 font-medium">
                  {paysLicense ? "Licencia de por vida" : "Total"}
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  {currency} {amount.toLocaleString()}
                </span>
              </div>

              {paysLicense && (
                <Text size="xs" className="mt-3 text-gray-600">
                  El plan básico se paga una sola vez (IVA incluido): tu
                  conjunto queda activo de por vida, sin mensualidades. Si
                  después pasas a Oro o Platino y no renuevas, vuelves a Básico
                  sin perder el acceso.
                </Text>
              )}

              {data?.lifetimeBasic && (
                <Text size="xs" className="mt-3 text-gray-600">
                  Tienes el plan básico de por vida: no hay nada que pagar.
                </Text>
              )}

              {data?.depositHeld && (
                <Text size="xs" className="mt-3 text-gray-600">
                  Tienes un depósito de {data.depositHeld.currency}{" "}
                  {data.depositHeld.amount.toLocaleString()} que se devuelve
                  desde el{" "}
                  {new Date(data.depositHeld.refundableAt).toLocaleDateString()}
                  . Registra la cuenta bancaria del conjunto para recibirlo.
                </Text>
              )}
            </div>

            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <Button
              onClick={() =>
                handlePay({ basicLicense: withLicense ? "add" : undefined })
              }
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

            {/* Oro o platino vencido: en vez de renovar, puede quedarse en
                Básico para siempre pagando sólo la licencia. */}
            {canAddLicense && licenseOffer && !data?.isActive && (
              <button
                type="button"
                className="mt-3 w-full text-sm text-cyan-700 underline disabled:opacity-50"
                disabled={loading || simulatePaymentMutation.isPending}
                onClick={() => handlePay({ basicLicense: "only" })}
              >
                Prefiero pagar solo la licencia ({licenseOffer.currency}{" "}
                {licenseOffer.total.toLocaleString()}) y quedar en Básico
              </button>
            )}

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

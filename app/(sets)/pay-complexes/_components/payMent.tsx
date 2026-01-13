// /* eslint-disable @next/next/no-img-element */
// "use client";

// import { useState } from "react";
// import {
//   Avatar,
//   Tooltip,
//   Text,
//   Button,
//   Title,
// } from "complexes-next-components";
// import { useTranslation } from "react-i18next";
// import { useLanguage } from "@/app/hooks/useLanguage";
// import { getTokenPayload } from "@/app/helpers/getTokenPayload";
// import { useConjuntoStore } from "../../ensemble/components/use-store";
// import { createPayment } from "../services/payment";
// import { planFeatures } from "../../registers/_components/register-complex/plans-features";
// import { usePaymentQuery } from "./payment-info-query";
// import { IoReturnDownBackOutline } from "react-icons/io5";
// import { useRouter } from "next/navigation";
// import { route } from "@/app/_domain/constants/routes";

// type Plan = "basic" | "gold" | "platinum";

// export default function Payment() {
//   const payload = getTokenPayload();
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const { data } = usePaymentQuery();
//   const router = useRouter();

//   const plan = data?.plan as Plan;
//   const amount = data?.prices ?? 0;
//   const currency = data?.currency ?? "";

//   const { t } = useTranslation();
//   const { language } = useLanguage();
//   const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
//   const storedUserId = typeof window !== "undefined" ? payload?.id : null;
//   const iduser = String(storedUserId);
//   const handlePay = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const payment = await createPayment({
//         user_id: iduser,
//         conjuntoId: String(conjuntoId),
//         country: "CO",
//         amount,
//         currency,
//         reference: `PAY-${Date.now()}`,
//       });

//       if (payment.provider === "STRIPE") {
//         window.location.href = payment.provider_response.url;
//       }

//       if (payment.provider === "DLOCAL") {
//         window.location.href = payment.provider_response.redirect_url;
//       }
//     } catch {
//       setError("No pudimos iniciar el pago. Intenta nuevamente.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div
//       key={language}
//       className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4"
//     >
//       <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 bg-white rounded-2xl shadow-xl overflow-hidden">
//         {/* LEFT – INFO */}
//         <div className="p-8 md:p-10 bg-gray-900 text-white">
//           <div className="mb-8">
//             <div className="flex gap-4 items-center">
//               <IoReturnDownBackOutline
//                 size={30}
//                 className="cursor-pointer"
//                 onClick={() => {
//                   router.push(route.myprofile);
//                 }}
//               />
//               <Avatar
//                 src="/complex.jpg"
//                 alt="complex"
//                 size="md"
//                 border="thick"
//                 shape="rounded"
//               />
//               <div>
//                 <Title as="h2" size="sm" font="semi" className="eading-tight">
//                   {data?.name} Activate
//                 </Title>
//                 <Text size="sm" colVariant="on">
//                   Plan {plan?.toUpperCase()}
//                 </Text>
//               </div>
//             </div>

//             <Text size="sm" colVariant="on" className="mt-3">
//               Estas son las funcionalidades de tu plan
//             </Text>
//           </div>

//           {/* FEATURES */}
//           <ul className="mt-4 space-y-2 text-sm">
//             {planFeatures[plan]?.map((featureKey) => {
//               const baseKey = `plans_features.${plan}.${featureKey}`;

//               const text = t(`${baseKey}.text`);
//               const tooltip = t(`${baseKey}.tooltip`, {
//                 defaultValue: t("sinDescripcion"),
//               });

//               const tachado =
//                 t(`${baseKey}.tachado`, {
//                   defaultValue: "false",
//                 }) === "true";

//               return (
//                 <li key={featureKey} className="flex items-start gap-2">
//                   <span className="mt-1 text-green-400">✔</span>

//                   <Tooltip content={tooltip} className="bg-gray-200 text-black">
//                     <Text
//                       size="sm"
//                       className={
//                         tachado ? "line-through text-gray-500" : "text-gray-100"
//                       }
//                     >
//                       {text}
//                     </Text>
//                   </Tooltip>
//                 </li>
//               );
//             })}
//           </ul>

//           <div className="mt-10 ">
//             <Text size="xs" colVariant="on">
//               Pago seguro procesado por Stripe o DLocal.
//             </Text>
//           </div>
//         </div>

//         {/* RIGHT – CHECKOUT */}
//         <section className="flex items-center justify-center">
//           <div className="p-8 md:p-10 w-full">
//             <Title as="h3" size="sm" font="semi" className="mb-6">
//               Resumen del pago
//             </Title>

//             <div className="border rounded-xl p-5 mb-6">
//               <div className="flex justify-between mb-3">
//                 <span className="text-sm text-gray-500">Nombre</span>
//                 <span className="text-sm font-medium capitalize">
//                   {data?.name}
//                 </span>
//               </div>
//               <div className="flex justify-between mb-3">
//                 <span className="text-sm text-gray-500">Dirección</span>
//                 <span className="text-sm font-medium capitalize">
//                   {data?.address}
//                 </span>
//               </div>
//               <div className="flex justify-between mb-3">
//                 <span className="text-sm text-gray-500">País</span>
//                 <span className="text-sm font-medium capitalize">
//                   {data?.country}
//                 </span>
//               </div>
//               <div className="flex justify-between mb-3">
//                 <span className="text-sm text-gray-500">Ciudad</span>
//                 <span className="text-sm font-medium capitalize">
//                   {data?.city}
//                 </span>
//               </div>
//               <div className="flex justify-between mb-3">
//                 <span className="text-sm text-gray-500">Sector</span>
//                 <span className="text-sm font-medium capitalize">
//                   {data?.neighborhood}
//                 </span>
//               </div>

//               <div className="flex justify-between mb-3">
//                 <span className="text-sm text-gray-500">Plan</span>
//                 <span className="text-sm font-medium capitalize">{plan}</span>
//               </div>

//               <div className="flex justify-between mb-3">
//                 <span className="text-sm text-gray-500">Duración</span>
//                 <span className="text-sm font-medium">30 días</span>
//               </div>

//               <div className="border-t pt-4 flex justify-between items-center">
//                 <span className="text-gray-900 font-medium">Total</span>
//                 <span className="text-2xl font-bold text-gray-900">
//                   {currency} {amount.toLocaleString()}
//                 </span>
//               </div>
//             </div>

//             {error && (
//               <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
//                 {error}
//               </div>
//             )}

//             {/* PAY BUTTON */}
//             <Button
//               onClick={handlePay}
//               disabled={loading || data?.isActive === true}
//               colVariant="success"
//               size="full"
//             >
//               {loading ? (
//                 <>
//                   <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Procesando pago…
//                 </>
//               ) : (
//                 "Pagar y activar"
//               )}
//             </Button>

//             {/* PAYMENT METHODS */}
//             <div className="mt-5 text-center">
//               <Text className="text-xs text-gray-500 mb-3">
//                 Medios de pago disponibles
//               </Text>

//               <div className="flex justify-center items-center gap-4 flex-wrap">
//                 <img
//                   src="/payments/visa.svg"
//                   alt="Visa"
//                   className="h-6 opacity-80"
//                 />
//                 <img
//                   src="/payments/mastercard.svg"
//                   alt="Mastercard"
//                   className="h-6 opacity-80"
//                 />
//                 <img
//                   src="/payments/amex.svg"
//                   alt="American Express"
//                   className="h-6 opacity-80"
//                 />
//                 <img
//                   src="/payments/pse.svg"
//                   alt="PSE"
//                   className="h-7 opacity-90"
//                 />
//               </div>

//               <Text className="text-[11px] text-gray-400 mt-3">
//                 Pagos procesados por Stripe o DLocal · Tarjeta y PSE
//               </Text>
//             </div>

//             <Text className="text-xs text-gray-400 text-center mt-6">
//               Al continuar aceptas nuestros términos y condiciones.
//             </Text>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import {
  Avatar,
  Tooltip,
  Text,
  Button,
  Title,
} from "complexes-next-components";
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

type Plan = "basic" | "gold" | "platinum";

// 🔹 ACTIVAR / DESACTIVAR SIMULACIÓN
const SIMULATE_PAYMENT = true;

export default function Payment() {
  const payload = getTokenPayload();
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

  const storedUserId = typeof window !== "undefined" ? payload?.id : null;
  const iduser = String(storedUserId);

  // ✅ Hook correcto de simulación (recibe conjuntoId)
  const simulatePaymentMutation = useSimulatePayment(String(conjuntoId));

  const handlePay = async () => {
    setLoading(true);
    setError(null);

    try {
      // ===============================
      // 🧪 SIMULACIÓN DE PAGO
      // ===============================
      if (SIMULATE_PAYMENT) {
        await simulatePaymentMutation.mutateAsync({
          amount,
          currency,
          plan,
        });

        return; // ⛔ corta aquí, NO pasa al pago real
      }

      // ===============================
      // 💳 PAGO REAL
      // ===============================
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
              <IoReturnDownBackOutline
                size={30}
                className="cursor-pointer"
                onClick={() => router.push(route.myprofile)}
              />
              <Avatar
                src="/complex.jpg"
                alt="complex"
                size="md"
                border="thick"
                shape="rounded"
              />
              <div>
                <Title as="h2" size="sm" font="semi">
                  {data?.name} Activate
                </Title>
                <Text size="sm" colVariant="on">
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

                  <Tooltip content={tooltip} className="bg-gray-200 text-black">
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
        </div>

        {/* RIGHT – CHECKOUT */}
        <section className="flex items-center justify-center">
          <div className="p-8 md:p-10 w-full">
            <Title as="h3" size="sm" font="semi" className="mb-6">
              Resumen del pago
            </Title>

            <div className="border rounded-xl p-5 mb-6">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">Plan</span>
                <span className="text-sm font-medium capitalize">{plan}</span>
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

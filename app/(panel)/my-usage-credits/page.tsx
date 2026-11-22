"use client";

import React, { useMemo } from "react";
import { Text } from "complexes-next-components";

import { HeaderAction } from "@/app/components/header";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { conjuntoChargesApi } from "@/app/components/platform-charge/platform-charge-api";
import UsageCreditsCard from "@/app/components/usage-credits/usage-credits-card";
import { conjuntoUsageCreditsApi } from "@/app/components/usage-credits/usage-credits-api";

/**
 * Consumo de Lary y de WhatsApp del conjunto y sus paquetes. Lo compra la
 * administración: lo gratis del mes lo trae el plan y lo que pasa de ahí
 * sale de los paquetes.
 */
export default function UsageCreditsPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const apis = useMemo(
    () =>
      conjuntoId
        ? {
            ai: conjuntoUsageCreditsApi("ai", String(conjuntoId)),
            whatsapp: conjuntoUsageCreditsApi("whatsapp", String(conjuntoId)),
            charges: conjuntoChargesApi(String(conjuntoId)),
          }
        : null,
    [conjuntoId],
  );

  return (
    <>
      <HeaderAction title="Lary y WhatsApp" />

      {!apis ? (
        <Text className="py-10 text-center text-gray-600 dark:text-slate-400">
          Selecciona un conjunto para continuar.
        </Text>
      ) : (
        <div className="mt-2 flex flex-col gap-6 lg:px-10">
          <UsageCreditsCard
            api={apis.ai}
            chargesApi={apis.charges}
            title="Consultas de Lary con IA"
            description="Las preguntas que Lary responde con inteligencia artificial. El saludo, el menú y las emergencias no se cuentan. Cuando se acaban las del mes, Lary sigue con las de tus paquetes."
          />

          <UsageCreditsCard
            api={apis.whatsapp}
            chargesApi={apis.charges}
            title="Mensajes de WhatsApp"
            description="El reenvío del chat, el código de acceso y el enlace para recuperar la contraseña por WhatsApp. Platino trae 1.000 al mes; en Básico y Oro, WhatsApp funciona con un paquete. Sin mensajes, los avisos siguen llegando por la app y el correo."
          />
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import { Text } from "complexes-next-components";
import { usePlanFeatures } from "@/app/hooks/usePlanFeatures";
import { useTokenPayload } from "@/app/components/session-provider";
import { route } from "@/app/_domain/constants/routes";

/**
 * Aviso de historial recortado, para los listados que lo respetan.
 *
 * Sin él, al Básico de por vida con el historial anual vencido le
 * "desaparecen" los registros viejos y parece que se perdieron. Están
 * guardados: el aviso lo dice y, a quien puede pagar, le muestra dónde.
 */
export default function HistoryNotice() {
  const { historySince } = usePlanFeatures();
  const payload = useTokenPayload();

  if (!historySince) return null;

  const since = new Date(historySince).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Pagar es cosa de la administración, igual que mejorar el plan.
  const canPay = payload?.roles?.includes("employee") ?? false;

  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 dark:border-amber-500/40 dark:bg-amber-500/10">
      <Text size="sm" className="text-amber-900 dark:text-amber-200">
        Estás viendo el historial desde el {since}. Lo anterior sigue guardado
        y vuelve a aparecer con el historial anual del plan Básico.{" "}
        {canPay && (
          <Link
            href={route.payComplexes}
            className="font-semibold underline text-amber-900 dark:text-amber-100"
          >
            Pagar historial
          </Link>
        )}
      </Text>
    </div>
  );
}

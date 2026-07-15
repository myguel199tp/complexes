"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Title } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bPlan,
  getB2bComercioPlans,
  requestB2bContract,
} from "../services/b2bAllianceService";

const PERIOD_LABEL: Record<string, string> = {
  mensual: "mensual",
  semestral: "semestral",
  anual: "anual",
};

export default function MyB2bComercioPage() {
  const params = useParams<{ comercioId: string }>();
  const comercioId = params.comercioId;
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((s) => s.showAlert);

  const { data: plans, isLoading } = useQuery({
    queryKey: ["my_b2b_plans", conjuntoId, comercioId],
    queryFn: () => getB2bComercioPlans(conjuntoId, comercioId),
    enabled: !!conjuntoId && !!comercioId,
  });

  const requestMut = useMutation({
    mutationFn: (planId: string) =>
      requestB2bContract(conjuntoId, { planId }),
    onSuccess: () => {
      showAlert(
        "Solicitud enviada. El comercio debe confirmarla.",
        "success",
      );
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  return (
    <div className="w-full p-2">
      <Link href="/my-b2b" className="text-cyan-300 text-sm hover:text-cyan-200">
        ← Volver a aliados
      </Link>

      <Title size="sm" font="bold" className="text-white mt-2">
        Planes disponibles
      </Title>
      <p className="text-slate-400 text-sm mt-1">
        Al solicitar un plan, queda pendiente hasta que el comercio lo confirme.
      </p>

      {isLoading ? (
        <p className="text-slate-400 text-sm mt-6">Cargando...</p>
      ) : plans && plans.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          {plans.map((p: B2bPlan) => (
            <div
              key={p.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex flex-col"
            >
              <span className="font-semibold text-slate-100">{p.name}</span>
              <span className="text-slate-400 text-xs mt-1">
                {p.description}
              </span>
              <span className="text-slate-200 text-sm mt-2">
                {p.price} {p.currency} / {PERIOD_LABEL[p.billingPeriod]}
                {p.pricingModel === "por_apartamento"
                  ? " · por apartamento"
                  : ""}
              </span>
              <Button
                colVariant="success"
                size="sm"
                rounded="md"
                className="mt-3"
                disabled={requestMut.isLoading}
                onClick={() => requestMut.mutate(p.id)}
              >
                {requestMut.isLoading ? "Enviando..." : "Solicitar alianza"}
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm mt-6">
          Este comercio aún no tiene planes publicados.
        </p>
      )}
    </div>
  );
}

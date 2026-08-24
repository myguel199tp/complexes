"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button, Title, Text } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bPlan,
  B2bRating,
  getB2bComercioPlans,
  getB2bComercioRatings,
  requestB2bContract,
} from "../services/b2bAllianceService";
import { StarRating } from "../_components/star-rating";

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

  const { data: ratings } = useQuery({
    queryKey: ["my_b2b_ratings", conjuntoId, comercioId],
    queryFn: () => getB2bComercioRatings(conjuntoId, comercioId),
    enabled: !!conjuntoId && !!comercioId,
  });

  const average =
    ratings && ratings.length > 0
      ? Math.round(
          (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length) * 10,
        ) / 10
      : null;

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
      <Text size="sm" className="text-slate-400 mt-1">
        Al solicitar un plan, queda pendiente hasta que el comercio lo confirme.
      </Text>

      {isLoading ? (
        <Text size="sm" className="text-slate-400 mt-6">Cargando...</Text>
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
        <Text size="sm" className="text-slate-400 mt-6">
          Este comercio aún no tiene planes publicados.
        </Text>
      )}

      <div className="mt-8">
        <div className="flex items-center gap-3">
          <Title size="sm" font="bold" className="text-white">
            Reputación
          </Title>
          <StarRating value={average} count={ratings?.length} size="md" />
        </div>

        {ratings && ratings.length > 0 ? (
          <div className="grid gap-3 mt-4">
            {ratings.map((r: B2bRating) => (
              <div
                key={r.id}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <StarRating value={r.rating} showValue={false} />
                  <span className="text-slate-500 text-xs">
                    {new Date(r.createdAt).toLocaleDateString("es-CO")}
                  </span>
                </div>
                <Text size="xs" className="text-slate-400 mt-1">{r.conjuntoName}</Text>
                {r.comment ? (
                  <Text size="sm" className="text-slate-300 mt-2">“{r.comment}”</Text>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <Text size="sm" className="text-slate-400 mt-2">
            Ningún conjunto ha calificado a esta empresa todavía.
          </Text>
        )}
      </div>
    </div>
  );
}

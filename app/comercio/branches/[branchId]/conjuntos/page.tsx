"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Title } from "complexes-next-components";
import { getComercioToken } from "../../../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  ComercioBillingPeriod,
  getNearbyConjuntos,
  subscribeToConjuntos,
} from "../../services/conjuntoSubscriptionService";

const PERIOD_LABELS: Record<ComercioBillingPeriod, string> = {
  mensual: "Mensual",
  semestral: "Semestral",
  anual: "Anual",
};

export default function BranchConjuntosPage() {
  const router = useRouter();
  const params = useParams();
  const branchId = String(params.branchId);
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [periods, setPeriods] = useState<Record<string, ComercioBillingPeriod>>(
    {},
  );

  useEffect(() => {
    if (!getComercioToken()) {
      router.push("/comercio/login");
    }
  }, [router]);

  const conjuntosQuery = useQuery({
    queryKey: ["comercio-nearby-conjuntos", branchId],
    queryFn: () => getNearbyConjuntos(branchId),
    enabled: !!branchId,
  });

  const subscribeMutation = useMutation({
    mutationFn: (conjuntoId: string) =>
      subscribeToConjuntos([
        {
          conjuntoId,
          branchId,
          billingPeriod: periods[conjuntoId] ?? "mensual",
        },
      ]),
    onSuccess: (res) => {
      showAlert(
        `Suscripción registrada (${res.currency} ${res.total.toLocaleString()})`,
        "success",
      );
      queryClient.invalidateQueries({
        queryKey: ["comercio-nearby-conjuntos", branchId],
      });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const conjuntos = conjuntosQuery.data ?? [];

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <Link href="/comercio/branches" className="text-cyan-400 text-sm">
          ← Volver a sucursales
        </Link>
        <Title as="h1" size="md" colVariant="on" font="semi" className="mt-2">
          Conjuntos cercanos
        </Title>
        <p className="mt-1 text-slate-500 text-sm">
          Conjuntos que coinciden con la ciudad y el barrio de esta sucursal.
          Elige la periodicidad y suscríbete para acceder a cada conjunto.
        </p>

        <div className="mt-6 space-y-3">
          {conjuntosQuery.isLoading ? (
            <p className="text-slate-400 p-4">Cargando conjuntos...</p>
          ) : conjuntos.length === 0 ? (
            <p className="text-slate-400 p-4">
              No hay conjuntos cercanos para esta sucursal (según ciudad y
              barrio).
            </p>
          ) : (
            conjuntos.map((conjunto) => {
              const selectedPeriod = periods[conjunto.id] ?? "mensual";
              const selectedPricing = conjunto.pricing.find(
                (p) => p.billingPeriod === selectedPeriod,
              );
              return (
                <div
                  key={conjunto.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-slate-100 font-semibold">
                        {conjunto.name}
                      </p>
                      <p className="text-slate-500 text-xs">
                        {conjunto.address} · {conjunto.neighborhood ?? "-"} ·{" "}
                        {conjunto.city}
                      </p>
                      <p className="text-slate-500 text-xs mt-1">
                        {conjunto.quantityapt ?? "?"} apartamentos
                      </p>
                    </div>
                    {conjunto.subscriptionActive ? (
                      <Badge colVariant="success" size="xs">
                        Activo
                      </Badge>
                    ) : conjunto.alreadySubscribed ? (
                      <Badge colVariant="warning" size="xs">
                        Vencido
                      </Badge>
                    ) : (
                      <Badge colVariant="danger" size="xs">
                        Sin suscripción
                      </Badge>
                    )}
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-end gap-3 border-t border-white/10 pt-4">
                    <label className="flex flex-col gap-1 text-xs text-slate-500">
                      Periodicidad
                      <select
                        value={selectedPeriod}
                        onChange={(e) =>
                          setPeriods((prev) => ({
                            ...prev,
                            [conjunto.id]: e.target
                              .value as ComercioBillingPeriod,
                          }))
                        }
                        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 text-sm"
                      >
                        {conjunto.pricing.map((p) => (
                          <option key={p.billingPeriod} value={p.billingPeriod}>
                            {PERIOD_LABELS[p.billingPeriod]}
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="flex-1">
                      <span className="block text-xs text-slate-500">
                        Precio
                      </span>
                      <span className="text-slate-100 font-semibold">
                        {conjunto.currency}{" "}
                        {Number(selectedPricing?.price ?? 0).toLocaleString()}
                      </span>
                    </div>

                    <Button
                      colVariant="success"
                      rounded="md"
                      size="sm"
                      disabled={subscribeMutation.isPending}
                      onClick={() => subscribeMutation.mutate(conjunto.id)}
                    >
                      {conjunto.alreadySubscribed ? "Renovar" : "Suscribir"}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

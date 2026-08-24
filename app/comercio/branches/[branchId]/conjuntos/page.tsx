"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Table, Title, Text } from "complexes-next-components";
import { useComercioGuard } from "../../../_lib/comercio-auth";
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
  useComercioGuard(() => router.push("/comercio/login"));

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

  const headers = [
    "Conjunto",
    "Ubicación",
    "Apts",
    "Periodicidad",
    "Precio",
    "Estado",
    "",
  ];
  const rows = conjuntos.map((conjunto) => {
    const selectedPeriod = periods[conjunto.id] ?? "mensual";
    const selectedPricing = conjunto.pricing.find(
      (p) => p.billingPeriod === selectedPeriod,
    );
    return [
      conjunto.name,
      `${conjunto.address} · ${conjunto.neighborhood ?? "-"} · ${conjunto.city}`,
      conjunto.quantityapt ?? "?",
      <select
        key={`period-${conjunto.id}`}
        value={selectedPeriod}
        onChange={(e) =>
          setPeriods((prev) => ({
            ...prev,
            [conjunto.id]: e.target.value as ComercioBillingPeriod,
          }))
        }
        className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-slate-100 text-sm"
      >
        {conjunto.pricing.map((p) => (
          <option key={p.billingPeriod} value={p.billingPeriod}>
            {PERIOD_LABELS[p.billingPeriod]}
          </option>
        ))}
      </select>,
      `${conjunto.currency} ${Number(selectedPricing?.price ?? 0).toLocaleString()}`,
      conjunto.subscriptionActive ? (
        <Badge key={conjunto.id} colVariant="success" size="xs">
          Activo
        </Badge>
      ) : conjunto.alreadySubscribed ? (
        <Badge key={conjunto.id} colVariant="warning" size="xs">
          Vencido
        </Badge>
      ) : (
        <Badge key={conjunto.id} colVariant="danger" size="xs">
          Sin suscripción
        </Badge>
      ),
      <div key={`actions-${conjunto.id}`} className="flex gap-2">
        <Button
          colVariant="success"
          rounded="md"
          size="xs"
          disabled={subscribeMutation.isPending}
          onClick={() => subscribeMutation.mutate(conjunto.id)}
        >
          {conjunto.alreadySubscribed ? "Renovar" : "Suscribir"}
        </Button>
      </div>,
    ];
  });

  const cellClasses = rows.map(() =>
    headers.map(() => "bg-white text-gray-700 px-3 py-2"),
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/comercio/branches" className="text-cyan-400 text-sm">
          ← Volver a sucursales
        </Link>
        <Title as="h1" size="lg" colVariant="on" font="semi" className="mt-2">
          Conjuntos cercanos
        </Title>
        <Text size="sm" className="mt-1 text-slate-500">
          Conjuntos que coinciden con la ciudad y el barrio de esta sucursal.
          Elige la periodicidad y suscríbete para acceder a cada conjunto.
        </Text>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl overflow-x-auto">
          {conjuntosQuery.isLoading ? (
            <Text size="sm" className="text-slate-400 p-4">Cargando conjuntos...</Text>
          ) : conjuntos.length === 0 ? (
            <Text size="sm" className="text-slate-400 p-4">
              No hay conjuntos cercanos para esta sucursal (según ciudad y
              barrio).
            </Text>
          ) : (
            <Table
              headers={headers}
              rows={rows}
              cellClasses={cellClasses}
              borderColor="text-gray-300"
            />
          )}
        </div>
      </div>
    </div>
  );
}

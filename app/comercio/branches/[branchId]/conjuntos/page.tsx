"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Badge,
  Button,
  Table,
  Title,
  Text,
} from "complexes-next-components";
import { useComercioGuard } from "../../../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  ComercioBillingPeriod,
  NearbyConjunto,
  getNearbyConjuntos,
  subscribeToConjuntos,
} from "../../services/conjuntoSubscriptionService";
import { SelectField } from "@/app/components/ui/form";

const PERIOD_LABELS: Record<ComercioBillingPeriod, string> = {
  mensual: "Mensual",
  semestral: "Semestral",
  anual: "Anual",
};

/** " · 1,6 km", con aviso cuando la cifra es solo entre ciudades. */
function distanceText(conjunto: NearbyConjunto): string {
  if (conjunto.distanceKm == null) return "";
  const km = conjunto.distanceKm.toLocaleString("es-CO", {
    maximumFractionDigits: 1,
  });
  if (conjunto.distancePrecision === "city") return ` · ${km} km entre ciudades`;
  if (conjunto.distancePrecision === "approx") return ` · ~${km} km`;
  return ` · ${km} km`;
}

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
        `Suscripción registrada (${res.currency} ${res.total.toLocaleString()}, IVA incluido)`,
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
      `${conjunto.address} · ${conjunto.neighborhood ?? "-"} · ${conjunto.cityName ?? conjunto.city}${distanceText(conjunto)}`,
      conjunto.quantityapt ?? "?",
      <SelectField
        key={`period-${conjunto.id}`}
        inputSize="sm"
        rounded="lg"
        defaultOption="Periodo"
        options={conjunto.pricing.map((p) => ({
          value: p.billingPeriod,
          label: PERIOD_LABELS[p.billingPeriod],
        }))}
        value={selectedPeriod}
        onChange={(e) =>
          setPeriods((prev) => ({
            ...prev,
            [conjunto.id]: e.target.value as ComercioBillingPeriod,
          }))
        }
      />,
      // Lo que se paga, con el IVA a la vista: el precio sin él solo
      // confundiría al llegar el cobro.
      <div key={`price-${conjunto.id}`} className="flex flex-col">
        <span>
          {conjunto.currency}{" "}
          {Number(selectedPricing?.total ?? selectedPricing?.price ?? 0).toLocaleString()}
        </span>
        {!!selectedPricing?.taxAmount && (
          <span className="text-xs text-slate-500 dark:text-slate-400">
            {Number(selectedPricing.price).toLocaleString()} + IVA{" "}
            {Number(selectedPricing.taxAmount).toLocaleString()}
          </span>
        )}
      </div>,
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
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <Link href="/comercio/branches" className="text-cyan-400 text-sm">
          ← Volver a sucursales
        </Link>
        <Title as="h1" size="xs" colVariant="on" font="semi" className="mt-2">
          Conjuntos cercanos
        </Title>
        <Text size="sm" className="mt-1 text-slate-500">
          Conjuntos a 40 km o menos de la ciudad de esta sucursal, los más
          cercanos primero.
          Elige la periodicidad y suscríbete para acceder a cada conjunto.
        </Text>
        {conjuntos.some((c) => c.distancePrecision === "city") && (
          <Text size="xs" className="mt-1 text-amber-400">
            Las distancias marcadas «entre ciudades» no distinguen conjuntos de
            la misma ciudad. Ubica tu sucursal en el mapa desde Sucursales para
            que el orden sea real.
          </Text>
        )}

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-2xl overflow-x-auto">
          {conjuntosQuery.isLoading ? (
            <Text size="sm" className="text-slate-400 p-4">Cargando conjuntos...</Text>
          ) : conjuntos.length === 0 ? (
            <Text size="sm" className="text-slate-400 p-4">
              No hay conjuntos a 40 km o menos de esta sucursal.
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge, Button, Title } from "complexes-next-components";
import { getComercioToken } from "../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  COMERCIO_PLANS,
  getComercioPaymentStatus,
  simulateComercioPayment,
} from "./services/comercioPaymentService";

const SIMULATE_PAYMENT = true;

export default function ComercioPaymentPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [selectedPlanId, setSelectedPlanId] = useState(COMERCIO_PLANS[0].id);

  useEffect(() => {
    if (!getComercioToken()) {
      router.push("/comercio/login");
    }
  }, [router]);

  const statusQuery = useQuery({
    queryKey: ["comercio-payment-status"],
    queryFn: getComercioPaymentStatus,
  });

  const simulateMutation = useMutation({
    mutationFn: () => {
      const plan = COMERCIO_PLANS.find((p) => p.id === selectedPlanId)!;
      return simulateComercioPayment({
        plan: plan.id,
        amount: plan.price,
        currency: plan.currency,
        billingPeriod: "anual",
      });
    },
    onSuccess: () => {
      showAlert(
        "¡Pago simulado correctamente! Tu plan anual está activo.",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["comercio-payment-status"] });
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const status = statusQuery.data;
  const isActive = !!status?.planActive;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Link href="/comercio/dashboard" className="text-cyan-400 text-sm">
          ← Volver al panel
        </Link>

        <Title as="h1" size="sm" colVariant="on" font="semi" className="mt-2">
          Mi plan y facturación
        </Title>

        <p className="mt-1 text-slate-500 text-sm">
          Todos los planes de comercio son anuales. Activa tu plan para poder
          crear sucursales, productos, servicios y todo lo demás.
        </p>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-2xl">
          {statusQuery.isLoading ? (
            <p className="text-slate-400">Cargando información de tu plan...</p>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-slate-500 text-xs">Plan actual</span>
                  <p className="text-slate-100 font-semibold text-lg capitalize">
                    {status?.plan ?? "Sin plan asignado"}
                  </p>
                </div>
                <Badge colVariant={isActive ? "success" : "danger"} size="sm">
                  {isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <div className="space-y-2 text-sm border-t border-white/10 pt-4">
                <div className="flex justify-between">
                  <span className="text-slate-500">Precio</span>
                  <span className="text-slate-200 font-medium">
                    {status?.currency}{" "}
                    {Number(status?.prices ?? 0).toLocaleString()}
                    /año
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Periodicidad</span>
                  <span className="text-slate-200 font-medium capitalize">
                    {status?.billingPeriod ?? "anual"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Último pago</span>
                  <span className="text-slate-200 font-medium">
                    {status?.lastPaymentDate
                      ? new Date(status.lastPaymentDate).toLocaleDateString()
                      : "Sin pagos registrados"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Próximo pago</span>
                  <span className="text-slate-200 font-medium">
                    {status?.nextPaymentDate
                      ? new Date(status.nextPaymentDate).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
                {status?.isExpiringSoon && (
                  <p className="text-amber-400 text-xs pt-2">
                    Tu plan vence en {status.daysRemaining} día(s).
                  </p>
                )}
              </div>

              <div className="mt-6 border-t border-white/10 pt-4">
                <span className="text-slate-500 text-xs">
                  {isActive ? "Cambiar plan / renovar" : "Elige un plan anual"}
                </span>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {COMERCIO_PLANS.map((plan) => (
                    <button
                      key={plan.id}
                      type="button"
                      onClick={() => setSelectedPlanId(plan.id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selectedPlanId === plan.id
                          ? "border-cyan-400 bg-cyan-400/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <span className="block text-slate-100 font-semibold">
                        {plan.label}
                      </span>
                      <span className="block text-slate-400 text-sm mt-1">
                        {plan.currency} {plan.price.toLocaleString()}/año
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                colVariant="success"
                size="full"
                rounded="md"
                className="mt-6"
                disabled={simulateMutation.isPending}
                onClick={() => simulateMutation.mutate()}
              >
                {simulateMutation.isPending
                  ? "Procesando pago..."
                  : isActive
                    ? "Renovar plan anual"
                    : "Pagar y activar plan anual"}
              </Button>

              {SIMULATE_PAYMENT && (
                <p className="text-xs text-yellow-600 text-center mt-3">
                  ⚠️ Modo simulación activo (no se realiza ningún cobro)
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

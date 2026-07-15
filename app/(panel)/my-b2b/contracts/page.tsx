"use client";

import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Title } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  B2bContract,
  B2bContractStatus,
  cancelB2bContract,
  getMyB2bContracts,
} from "../services/b2bAllianceService";

const STATUS_LABELS: Record<B2bContractStatus, string> = {
  pending: "Pendiente de confirmación",
  active: "Activo",
  rejected: "Rechazado",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<B2bContractStatus, string> = {
  pending: "text-amber-400",
  active: "text-emerald-400",
  rejected: "text-red-400",
  cancelled: "text-slate-500",
};

export default function MyB2bContractsPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const { data: contracts, isLoading } = useQuery({
    queryKey: ["my_b2b_contracts", conjuntoId],
    queryFn: () => getMyB2bContracts(conjuntoId),
    enabled: !!conjuntoId,
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => cancelB2bContract(conjuntoId, id),
    onSuccess: () => {
      showAlert("Contrato cancelado", "success");
      queryClient.invalidateQueries({
        queryKey: ["my_b2b_contracts", conjuntoId],
      });
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  return (
    <div className="w-full p-2">
      <div className="flex items-center justify-between">
        <Title size="sm" font="bold" className="text-white">
          Mis contratos B2B
        </Title>
        <Link href="/my-b2b" className="text-cyan-300 text-sm hover:text-cyan-200">
          ← Aliados
        </Link>
      </div>

      {isLoading ? (
        <p className="text-slate-400 text-sm mt-6">Cargando...</p>
      ) : contracts && contracts.length > 0 ? (
        <div className="grid gap-3 mt-6">
          {contracts.map((c: B2bContract) => (
            <div
              key={c.id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex justify-between gap-3"
            >
              <div>
                <p className="font-semibold text-slate-100">
                  {c.planName}{" "}
                  <span className={`ml-2 text-xs ${STATUS_COLORS[c.status]}`}>
                    {STATUS_LABELS[c.status]}
                  </span>
                </p>
                <p className="text-slate-400 text-xs">
                  {c.comercio?.businessName ?? ""}
                </p>
                <p className="text-slate-200 text-sm mt-1">
                  {c.amount} {c.currency} / {c.billingPeriod}
                  {c.pricingModel === "por_apartamento" && c.quantityapt
                    ? ` (${c.quantityapt} apt)`
                    : ""}
                </p>
                {c.rejectionReason ? (
                  <p className="text-red-400 text-xs mt-1">
                    Motivo: {c.rejectionReason}
                  </p>
                ) : null}
              </div>
              {c.status === "pending" || c.status === "active" ? (
                <Button
                  colVariant="danger"
                  size="xs"
                  rounded="md"
                  disabled={cancelMut.isLoading}
                  onClick={() => cancelMut.mutate(c.id)}
                >
                  Cancelar
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm mt-6">
          Aún no has solicitado ningún contrato.
        </p>
      )}
    </div>
  );
}

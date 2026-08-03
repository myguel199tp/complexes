/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useVisits } from "./use-visit-query";
import { VisitResponse } from "../../services/response/VisitResponse";
import { useMutationVerifyPayment } from "./visit-pay-mutation";
import { VisitProofCell } from "./visit-proof-cell";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

const PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 350;

export function useTableInfo() {
  const [filterText, setFilterText] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { t } = useTranslation();
  const { language } = useLanguage();

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  /**
   * La búsqueda se resuelve en el servidor: antes se descargaba la bitácora
   * completa del conjunto y se filtraba en el navegador.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(filterText.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [filterText]);

  const params = useMemo(
    () => ({ page, limit: PAGE_SIZE, search: search || undefined }),
    [page, search],
  );

  const { result, error, isLoading } = useVisits(params);

  const verifyMutation = useMutationVerifyPayment();

  function getDuration(visit: VisitResponse) {
    if (!visit.entryTime) return 0;

    const end = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const start = new Date(visit.entryTime);

    return Math.max(
      0,
      Math.floor((end.getTime() - start.getTime()) / (1000 * 60)),
    );
  }

  /**
   * El monto lo congela el backend al registrar la salida. Solo se estima aquí
   * mientras el visitante sigue dentro; recalcularlo siempre hacía que una
   * visita ya pagada cambiara de valor al subir la tarifa.
   */
  function getCost(visit: VisitResponse) {
    if (typeof visit.parkingAmount === "number") return visit.parkingAmount;

    if (!visit.hasParking || !visit.entryTime) return 0;

    const end = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const start = new Date(visit.entryTime);

    const hours = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)),
    );

    return hours * (visit.parkingRatePerHour || 0);
  }

  function formatTime(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  function formatDate(date?: string) {
    if (!date) return "-";
    return new Date(date).toLocaleString("es-CO");
  }

  function approvePayment(id: string) {
    verifyMutation.mutate({
      visitId: id,
      action: "approve",
    });
  }

  function rejectPayment(id: string) {
    verifyMutation.mutate({
      visitId: id,
      action: "reject",
    });
  }

  const headers = useMemo(
    () => [
      t("nombreVisistante"),
      t("numeroDocumento"),
      t("numeroInmuebleResidencial"),
      t("numeroPlaca"),
      t("tipovisitante"),
      "Estado",
      "Entrada",
      "Salida",
      "Tiempo",
      "Costo",
      "Comprobante",
      "Acciones",
    ],
    [t],
  );

  const filteredRows = useMemo(() => {
    return result.data.map((visit) => {
      const duration = getDuration(visit);
      const cost = getCost(visit);

      return [
        visit.namevisit || "",
        visit.numberId || "",
        visit.apartment || "",
        visit.plaque || "-",
        visit.visitType || "",
        visit.status || "",
        formatDate(visit.entryTime),
        formatDate(visit.exitTime),
        formatTime(duration),
        `$${cost.toLocaleString("es-CO")}`,

        <VisitProofCell
          key={`proof-${visit.id}`}
          visitId={visit.id}
          conjuntoId={conjuntoId ?? undefined}
          hasProof={Boolean(visit.paymentProof)}
        />,

        visit.paymentVerificationStatus === "PENDING" ||
        visit.paymentVerificationStatus === "REVIEW" ? (
          <div key={`actions-${visit.id}`} style={{ display: "flex", gap: 8 }}>
            <button
              style={{
                background: "#16a34a",
                color: "white",
                border: "none",
                padding: "4px 10px",
                borderRadius: 6,
                cursor: "pointer",
              }}
              onClick={() => approvePayment(visit.id)}
            >
              Aprobar
            </button>

            <button
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "4px 10px",
                borderRadius: 6,
                cursor: "pointer",
              }}
              onClick={() => rejectPayment(visit.id)}
            >
              Rechazar
            </button>
          </div>
        ) : (
          visit.paymentVerificationStatus
        ),
      ];
    });
  }, [result.data, conjuntoId]);

  return {
    data: result.data,
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
    setPage,
    error,
    isLoading,
    headers,
    filteredRows,
    filterText,
    setFilterText,
    t,
    language,
  };
}

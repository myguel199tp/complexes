/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useVisits } from "./use-visit-query";
import { VisitResponse } from "../../services/response/VisitResponse";
import { useMutationVerifyPayment } from "./visit-pay-mutation";

export function useTableInfo() {
  const [filterText, setFilterText] = useState("");

  const { t } = useTranslation();
  const { language } = useLanguage();

  const { data = [], error, isLoading } = useVisits();

  const verifyMutation = useMutationVerifyPayment();

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  function getDuration(visit: VisitResponse) {
    if (!visit.entryTime) return 0;

    const end = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const start = new Date(visit.entryTime);

    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }

  function getCost(visit: VisitResponse) {
    if (!visit.hasParking || !visit.entryTime) return 0;

    const end = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const start = new Date(visit.entryTime);

    const hours = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60),
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
    const filterLower = filterText.toLowerCase();

    return data
      .filter((visit) => {
        return (
          visit.namevisit?.toLowerCase().includes(filterLower) ||
          String(visit.apartment).toLowerCase().includes(filterLower) ||
          (visit.plaque || "").toLowerCase().includes(filterLower) ||
          visit.visitType?.toLowerCase().includes(filterLower) ||
          (visit.numberId || "").toLowerCase().includes(filterLower)
        );
      })
      .map((visit) => {
        const duration = getDuration(visit);
        const cost = getCost(visit);

        const proofUrl = visit.paymentProof
          ? `${BASE_URL}/${visit.paymentProof.replace(/\\/g, "/")}`
          : null;

        return [
          visit.namevisit || "",
          visit.numberId || "",
          visit.apartment || "",
          visit.plaque || "-",
          visit.visitType || "",
          formatDate(visit.entryTime),
          formatDate(visit.exitTime),
          formatTime(duration),
          `$${cost.toLocaleString("es-CO")}`,

          proofUrl ? (
            <img
              key={`proof-${visit.id}`}
              src={proofUrl}
              alt="comprobante"
              style={{ width: 60, cursor: "pointer", borderRadius: 6 }}
              onClick={() => window.open(proofUrl, "_blank")}
            />
          ) : (
            "Sin comprobante"
          ),

          visit.paymentVerificationStatus === "REVIEW" ? (
            <div
              key={`actions-${visit.id}`}
              style={{ display: "flex", gap: 8 }}
            >
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
  }, [data, filterText, BASE_URL]);

  return {
    data,
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

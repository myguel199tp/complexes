"use client";

import React, { useState } from "react";
import { Button, SelectField, Text, Title } from "complexes-next-components";
import { MdOutlineReportProblem } from "react-icons/md";

import { useContractRequestsQuery } from "./requests-query";
import { PriorityChip, StatusChip, TargetChip } from "./request-chips";
import NewRequestModal from "./new-request-modal";
import RequestDetailModal from "./request-detail-modal";
import {
  ContractRequestStatus,
  REQUEST_STATUS_LABEL,
} from "../../services/response/contractRequestResponse";

interface Props {
  /**
   * Gestionar es cambiar estados, fijar costos y responderle a la aseguradora:
   * eso es del propietario y del personal.
   */
  canManage: boolean;
  /**
   * Radicar es del arrendatario, que es quien vive el inmueble y ve el daño.
   * Va aparte de `canManage` a propósito: son permisos opuestos, no dos grados
   * del mismo. Al propietario el panel le sirve de seguimiento, y ofrecerle un
   * botón de "Reportar" solo le da una acción que no le corresponde.
   */
  canReport: boolean;
  /** Nombre de la compañía, para avisar al radicar a quién le va a llegar. */
  insurerName?: string;
  /** Sin contrato no hay a qué colgar una solicitud. */
  hasContract: boolean;
}

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Todos los estados" },
  ...(Object.keys(REQUEST_STATUS_LABEL) as ContractRequestStatus[]).map(
    (value) => ({ value, label: REQUEST_STATUS_LABEL[value] }),
  ),
];

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-CO");

export default function RequestsPanel({
  canManage,
  canReport,
  insurerName,
  hasContract,
}: Props) {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showNew, setShowNew] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  const { data, isInitialLoading, error } = useContractRequestsQuery(
    statusFilter ? { status: statusFilter as ContractRequestStatus } : {},
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <Title colVariant="on" as="h3" size="xs" font="semi">
          Daños y solicitudes
        </Title>

        <div className="flex items-center gap-2">
          <SelectField
            options={STATUS_FILTERS}
            defaultOption="Todos los estados"
            inputSize="sm"
            rounded="md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />

          {canReport && (
            <Button
              colVariant="success"
              rounded="md"
              size="sm"
              onClick={() => setShowNew(true)}
              disabled={!hasContract}
            >
              + Reportar
            </Button>
          )}
        </div>
      </div>

      {!hasContract ? (
        <div className="p-4 rounded-xl border border-dashed border-gray-300 text-center">
          <Text size="sm" className="text-gray-500">
            Necesitas un contrato registrado para reportar daños.
          </Text>
        </div>
      ) : isInitialLoading ? (
        <div className="space-y-2 animate-pulse">
          <div className="h-14 bg-gray-100 rounded-xl" />
          <div className="h-14 bg-gray-100 rounded-xl" />
        </div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
          <Text size="sm" colVariant="danger">
            No se pudieron cargar las solicitudes
          </Text>
        </div>
      ) : !data?.length ? (
        <div className="p-6 rounded-xl border border-dashed border-gray-300 text-center space-y-2">
          <MdOutlineReportProblem size={32} className="mx-auto text-gray-400" />
          <Text size="sm" className="text-gray-500">
            {statusFilter
              ? "No hay solicitudes en ese estado"
              : canReport
                ? "Todavía no has reportado ningún daño"
                : "El arrendatario no ha reportado daños"}
          </Text>
        </div>
      ) : (
        <ul className="space-y-2">
          {data.map((request) => (
            <li key={request.id}>
              <button
                type="button"
                onClick={() => setOpenId(request.id)}
                className="w-full text-left p-3 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Text size="xs" className="text-gray-500 font-mono">
                    {request.radicado}
                  </Text>
                  <StatusChip status={request.status} />
                  <PriorityChip priority={request.priority} />
                  <TargetChip target={request.routedTo} />
                </div>

                <Text size="sm" font="semi" className="text-gray-800">
                  {request.title}
                </Text>

                <Text size="xs" className="text-gray-500">
                  {request.typeLabel}
                  {request.category ? ` · ${request.category}` : ""}
                  {" · "}
                  {formatDate(request.createdAt)}
                  {request.filesCount > 0
                    ? ` · ${request.filesCount} evidencia(s)`
                    : ""}
                </Text>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showNew && canReport && (
        <NewRequestModal
          isOpen={showNew}
          onClose={() => setShowNew(false)}
          insurerName={insurerName}
        />
      )}

      {openId !== null && (
        <RequestDetailModal
          requestId={openId}
          isOpen={openId !== null}
          onClose={() => setOpenId(null)}
          canManage={canManage}
        />
      )}
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Modal, Table, Text } from "complexes-next-components";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { route } from "@/app/_domain/constants/routes";
import {
  CLOSURE_REASONS,
  LegalCase,
  LegalCaseClosureReason,
  LegalCaseStatus,
} from "../services/legalCollectionService";
import {
  useCloseLegalCaseMutation,
  useLegalCasesQuery,
  useUpdateLegalCaseMutation,
} from "./use-legal-collection-query";

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

const shortDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("es-CO") : "-";

/** Color por etapa: cuanto más avanzado el proceso, más fuerte el rojo. */
const STATUS_STYLE: Record<LegalCaseStatus, string> = {
  PREJURIDICO: "bg-amber-100 text-amber-800",
  JURIDICO: "bg-orange-100 text-orange-800",
  DEMANDADO: "bg-red-100 text-red-800",
  ACUERDO: "bg-green-100 text-green-800",
  CERRADO: "bg-gray-100 text-gray-600",
};

/**
 * Siguiente etapa a la que se puede mover un caso.
 *
 * `ACUERDO` no está: lo asigna el módulo de acuerdos de pago al firmar, y
 * ponerlo a mano dejaría el caso suspendido sin ningún acuerdo detrás.
 */
const NEXT_STAGE: Partial<Record<LegalCaseStatus, LegalCaseStatus>> = {
  PREJURIDICO: "JURIDICO",
  JURIDICO: "DEMANDADO",
};

const STAGE_LABEL: Record<LegalCaseStatus, string> = {
  PREJURIDICO: "Prejurídico",
  JURIDICO: "Jurídico",
  DEMANDADO: "Demandado",
  ACUERDO: "Con acuerdo",
  CERRADO: "Cerrado",
};

/**
 * Expedientes de cobro jurídico.
 *
 * No existía como pantalla: el escalamiento se decidía mirando el tramo de +120
 * días de la cartera y no quedaba registrado en ninguna parte, así que no se
 * podía responder qué unidades están en cobro, desde cuándo ni con qué abogado.
 */
export default function LegalCases() {
  const router = useRouter();

  const [includeClosed, setIncludeClosed] = useState(false);
  const { data, isLoading, error } = useLegalCasesQuery({ includeClosed });

  const advance = useUpdateLegalCaseMutation();
  const closeCase = useCloseLegalCaseMutation();

  const [detail, setDetail] = useState<LegalCase | null>(null);
  const [closing, setClosing] = useState<LegalCase | null>(null);
  const [closureReason, setClosureReason] =
    useState<LegalCaseClosureReason>("PAGO_TOTAL");
  const [closureNote, setClosureNote] = useState("");

  const headers = [
    "Unidad",
    "Residente",
    "Etapa",
    "Deuda al trasladar",
    "Mora al abrir",
    "Abierto",
    "Abogado",
    "Acciones",
  ];

  const cases = data?.cases ?? [];

  const rows = cases.map((item) => [
    item.unit.label,

    item.unit.resident,

    <span
      key={`status-${item.id}`}
      className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${
        STATUS_STYLE[item.status]
      }`}
    >
      {item.statusLabel}
    </span>,

    money(item.debtSnapshot),

    `${item.daysOverdueAtOpen} días`,

    shortDate(item.openedAt),

    item.lawyerName || "-",

    <div key={`actions-${item.id}`} className="flex flex-wrap gap-1">
      <button
        onClick={() => setDetail(item)}
        className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
      >
        Expediente
      </button>

      {item.isOpen && NEXT_STAGE[item.status] && (
        <button
          onClick={() =>
            advance.mutate({
              caseId: item.id,
              status: NEXT_STAGE[item.status],
            })
          }
          disabled={advance.isPending}
          className="rounded bg-orange-600 px-2 py-1 text-xs text-white hover:bg-orange-700 disabled:opacity-50"
        >
          Pasar a {STAGE_LABEL[NEXT_STAGE[item.status]!]}
        </button>
      )}

      {item.isOpen && (
        <button
          onClick={() => {
            setClosing(item);
            setClosureReason("PAGO_TOTAL");
            setClosureNote("");
          }}
          className="rounded border border-green-400 px-2 py-1 text-xs text-green-700 hover:bg-green-50"
        >
          Cerrar
        </button>
      )}
    </div>,
  ]);

  const cellClasses = rows.map(() =>
    headers.map(() => "bg-white text-gray-700"),
  );

  const summary = data?.summary;

  return (
    <div className="flex w-full flex-col p-4">
      <HeaderAction
        title="Cobro jurídico"
        tooltip="Volver a la cartera"
        onClick={() => router.push(route.feesPortfolio)}
        icon={<CiViewTable color="white" size={34} />}
        idicative="Volver a la cartera"
      />

      {error && (
        <Text size="sm" className="mt-4 text-red-500">
          No se pudieron cargar los casos: {String(error)}
        </Text>
      )}

      {summary && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-lg border bg-white p-3">
            <Text size="xs" className="text-gray-500">
              Casos abiertos
            </Text>
            <Text font="bold" className="text-red-600">
              {summary.open}
            </Text>
          </div>

          {/*
            Es la deuda congelada el día de cada traslado, no la de hoy: el
            saldo sigue moviéndose después de escalar y esta es la cifra por la
            que se abrió cada expediente.
          */}
          <div className="rounded-lg border bg-white p-3">
            <Text size="xs" className="text-gray-500">
              Escalado al trasladar
            </Text>
            <Text font="bold">{money(summary.debtSnapshot)}</Text>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <Text size="xs" className="text-gray-500">
              Demandados
            </Text>
            <Text font="bold">{summary.byStatus.DEMANDADO ?? 0}</Text>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <Text size="xs" className="text-gray-500">
              Con acuerdo de pago
            </Text>
            <Text font="bold" className="text-green-600">
              {summary.byStatus.ACUERDO ?? 0}
            </Text>
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={includeClosed}
            onChange={(e) => setIncludeClosed(e.target.checked)}
          />
          Mostrar también los casos cerrados
        </label>

        <Button
          colVariant="primary"
          rounded="md"
          className="ml-auto"
          onClick={() => router.push(route.feesPortfolio)}
        >
          Trasladar una unidad
        </Button>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <Text size="sm" className="text-gray-500">
            Cargando casos...
          </Text>
        ) : !cases.length ? (
          <Text size="sm" className="text-gray-500">
            No hay casos de cobro jurídico. Se abren desde la cartera, sobre una
            unidad concreta.
          </Text>
        ) : (
          <Table
            headers={headers}
            rows={rows}
            cellClasses={cellClasses}
            columnWidths={[
              "10%",
              "16%",
              "11%",
              "13%",
              "10%",
              "9%",
              "13%",
              "18%",
            ]}
          />
        )}
      </div>

      {/* EXPEDIENTE */}
      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Expediente · ${detail.unit.label}` : "Expediente"}
        className="w-[95%] max-w-2xl"
      >
        {detail && (
          <div className="flex max-h-[75vh] flex-col gap-3 overflow-y-auto py-2 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Text size="xs" className="text-gray-500">
                  Residente
                </Text>
                <Text size="sm">{detail.unit.resident}</Text>
              </div>

              <div>
                <Text size="xs" className="text-gray-500">
                  Etapa
                </Text>
                <Text size="sm">{detail.statusLabel}</Text>
              </div>

              <div>
                <Text size="xs" className="text-gray-500">
                  Deuda al trasladar
                </Text>
                <Text size="sm">{money(detail.debtSnapshot)}</Text>
              </div>

              <div>
                <Text size="xs" className="text-gray-500">
                  Mora al abrir
                </Text>
                <Text size="sm">{detail.daysOverdueAtOpen} días</Text>
              </div>

              <div>
                <Text size="xs" className="text-gray-500">
                  Abierto
                </Text>
                <Text size="sm">
                  {shortDate(detail.openedAt)}
                  {detail.openedByName ? ` · ${detail.openedByName}` : ""}
                </Text>
              </div>

              <div>
                <Text size="xs" className="text-gray-500">
                  Radicado
                </Text>
                <Text size="sm">{detail.externalCaseRef || "-"}</Text>
              </div>

              <div className="col-span-2">
                <Text size="xs" className="text-gray-500">
                  Abogado
                </Text>
                <Text size="sm">
                  {[detail.lawyerName, detail.lawyerEmail, detail.lawyerPhone]
                    .filter(Boolean)
                    .join(" · ") || "Sin asignar"}
                </Text>
              </div>
            </div>

            {detail.closedAt && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <Text size="xs" className="text-gray-500">
                  Cerrado el {shortDate(detail.closedAt)}
                </Text>
                <Text size="sm">{detail.closureLabel}</Text>
              </div>
            )}

            {/*
              Las notas se acumulan y no se reemplazan: el expediente es la
              historia del caso, y sobrescribirla borraría en qué se fundamentó
              el traslado.
            */}
            <div>
              <Text size="xs" className="text-gray-500">
                Historia del caso
              </Text>
              <pre className="mt-1 whitespace-pre-wrap rounded-lg border bg-gray-50 p-3 font-sans text-sm text-gray-700">
                {detail.notes || "Sin notas"}
              </pre>
            </div>

            <div className="flex justify-end border-t pt-3">
              <Button
                colVariant="default"
                rounded="md"
                onClick={() => setDetail(null)}
              >
                Cerrar
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* CIERRE */}
      <Modal
        isOpen={!!closing}
        onClose={() => setClosing(null)}
        title={closing ? `Cerrar caso · ${closing.unit.label}` : "Cerrar caso"}
      >
        <div className="flex flex-col gap-3 py-2">
          <Text size="sm" className="text-gray-600">
            El motivo queda en el expediente: es lo que distingue un cobro que
            terminó en pago de uno que el conjunto abandonó.
          </Text>

          <div className="flex flex-col gap-2">
            {CLOSURE_REASONS.map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="radio"
                  name="closure"
                  checked={closureReason === option.value}
                  onChange={() => setClosureReason(option.value)}
                />
                {option.label}
              </label>
            ))}
          </div>

          <textarea
            value={closureNote}
            onChange={(e) => setClosureNote(e.target.value)}
            rows={3}
            placeholder="Detalle del cierre (opcional)"
            className="w-full rounded-md border p-3 text-sm"
          />

          <div className="flex justify-end gap-2">
            <Button
              colVariant="default"
              rounded="md"
              onClick={() => setClosing(null)}
              disabled={closeCase.isPending}
            >
              Cancelar
            </Button>

            <Button
              colVariant="success"
              rounded="md"
              disabled={closeCase.isPending}
              onClick={() =>
                closing &&
                closeCase.mutate(
                  {
                    caseId: closing.id,
                    closureReason,
                    note: closureNote.trim() || undefined,
                  },
                  { onSuccess: () => setClosing(null) },
                )
              }
            >
              {closeCase.isPending ? "Cerrando..." : "Cerrar caso"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

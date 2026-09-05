"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Badge,
  Button,
  InputField,
  Modal,
  SelectField,
  Table,
  Text,
} from "complexes-next-components";
import { IoSearchCircle } from "react-icons/io5";
import { CiViewTable } from "react-icons/ci";
import { HeaderAction } from "@/app/components/header";
import { route } from "@/app/_domain/constants/routes";
import { useDebouncedValue } from "@/app/hooks/useDebouncedValue";
import {
  usePortfolioQuery,
  useRemindPortfolioMutation,
  useRemindUnitMutation,
} from "./use-portfolio-query";
import TransferToLegalModal from "./transfer-to-legal-modal";
import type { PortfolioUnit } from "../services/portfolioService";

const money = (value: number) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value || 0);

/**
 * Tramos de mora sobre los que se arma una gestión de cobro. Son los mismos
 * cortes que devuelve el backend en `aging`.
 */
const AGING_OPTIONS = [
  { label: "Toda la cartera", value: "" },
  { label: "Más de 30 días", value: "31" },
  { label: "Más de 60 días", value: "61" },
  { label: "Más de 90 días", value: "91" },
  { label: "Más de 120 días", value: "121" },
];

/**
 * Cartera del conjunto: quién debe, cuánto y desde hace cuánto.
 *
 * Antes esto no existía como pantalla. La deuda solo se veía dentro del
 * dashboard de residentes, que se traía todas las cuotas del conjunto y las
 * sumaba en el navegador, sin antigüedad y sin forma de actuar sobre ella.
 */
export default function Portfolio() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [tower, setTower] = useState("");
  const [minDays, setMinDays] = useState("");

  const debouncedSearch = useDebouncedValue(search, 400);

  const filters = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      tower: tower || undefined,
      minDaysOverdue: minDays ? Number(minDays) : undefined,
    }),
    [debouncedSearch, tower, minDays],
  );

  const { data, isLoading, error } = usePortfolioQuery(filters);

  const remindUnit = useRemindUnitMutation();
  const remindAll = useRemindPortfolioMutation();

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkNote, setBulkNote] = useState("");

  /** Unidad que se está trasladando a cobro jurídico. */
  const [transferring, setTransferring] = useState<PortfolioUnit | null>(null);

  /**
   * Exportar se resuelve en el navegador con los datos que ya están en
   * pantalla: no hace falta un endpoint aparte ni una librería para armar un
   * CSV, y así lo exportado coincide exactamente con lo que se está viendo.
   */
  const exportCsv = () => {
    if (!data?.units.length) return;

    const headers = [
      "Torre",
      "Apartamento",
      "Residente",
      "Correo",
      "Teléfono",
      "Saldo",
      "Vencido",
      "Mora",
      "Por verificar",
      "Cuotas",
      "Días de la más antigua",
      "Hasta 30",
      "31-60",
      "61-90",
      "91-120",
      "+120",
      "Cobro jurídico",
    ];

    // Las comillas dobles dentro de un campo se escapan duplicándolas.
    const escape = (value: unknown) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;

    const rows = data.units.map((unit) =>
      [
        unit.tower,
        unit.apartment,
        unit.resident,
        unit.email,
        unit.phone,
        unit.outstanding,
        unit.overdue,
        unit.mora,
        unit.inReview,
        unit.feesCount,
        unit.daysOverdue,
        unit.aging.current,
        unit.aging.days30,
        unit.aging.days60,
        unit.aging.days90,
        unit.aging.days90plus,
        unit.legalCase
          ? unit.legalCase.statusLabel
          : unit.legalCandidate
            ? "Candidata"
            : "",
      ]
        .map(escape)
        .join(";"),
    );

    // El BOM hace que Excel en español abra el archivo como UTF-8 y no parta
    // las tildes.
    const csv = `﻿${headers.map(escape).join(";")}\n${rows.join("\n")}`;

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = `cartera-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const headers = [
    "Unidad",
    "Residente",
    "Saldo",
    "Vencido",
    "Mora",
    "Antigüedad",
    "Cuotas",
    "Por verificar",
    "Jurídica",
    "Acciones",
  ];

  const rows = (data?.units ?? []).map((unit: PortfolioUnit) => [
    [unit.tower, unit.apartment].filter(Boolean).join(" - ") || "-",

    unit.resident,

    money(unit.outstanding),

    money(unit.overdue),

    money(unit.mora),

    /*
      La antigüedad es lo que decide a quién se cobra primero y a quién se
      traslada. Se marca en rojo a partir de 90 días, que es el corte habitual.
    */
    <span
      key={`age-${unit.relationId}`}
      className={
        unit.daysOverdue > 90
          ? "font-bold text-red-600"
          : unit.daysOverdue > 60
            ? "font-semibold text-orange-600"
            : "text-gray-700"
      }
    >
      {unit.daysOverdue > 0 ? `${unit.daysOverdue} días` : "Al día"}
    </span>,

    unit.feesCount,

    unit.inReview > 0 ? money(unit.inReview) : "-",

    /*
      Estado de cobro jurídico. La unidad ya trasladada muestra su etapa; la que
      supera el corte del conjunto se marca como candidata, que es solo una
      sugerencia: trasladar siempre lo decide una persona.
    */
    unit.legalCase ? (
      <span
        key={`legal-${unit.relationId}`}
        className="inline-block rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700"
      >
        {unit.legalCase.statusLabel}
      </span>
    ) : unit.legalCandidate ? (
      <span
        key={`legal-${unit.relationId}`}
        className="inline-block rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700"
      >
        Candidata
      </span>
    ) : (
      "-"
    ),

    <div key={`actions-${unit.relationId}`} className="flex flex-wrap gap-1">
      <button
        onClick={() => remindUnit.mutate({ relationId: unit.relationId })}
        disabled={remindUnit.isPending}
        className="rounded bg-cyan-600 px-3 py-1 text-sm text-white hover:bg-cyan-700 disabled:opacity-50"
      >
        Cobrar
      </button>

      {/*
        Una unidad con caso abierto no se puede volver a trasladar: solo cabe un
        expediente vivo por unidad, y el backend lo rechaza. Se muestra el
        acceso al expediente en su lugar.
      */}
      {unit.legalCase ? (
        <button
          onClick={() => router.push(route.feesLegal)}
          className="rounded border border-red-300 px-3 py-1 text-sm text-red-700 hover:bg-red-50"
        >
          Ver caso
        </button>
      ) : (
        <button
          onClick={() => setTransferring(unit)}
          className="rounded border border-gray-300 px-3 py-1 text-sm text-gray-700 hover:border-red-400 hover:text-red-700"
        >
          Trasladar
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
        title="Cartera del conjunto"
        tooltip="Volver a cuotas"
        onClick={() => router.push(route.myfees)}
        icon={<CiViewTable color="white" size={34} />}
        idicative="Volver a cuotas"
      />

      {error && (
        <Text size="sm" className="mt-4 text-red-500">
          No se pudo cargar la cartera: {String(error)}
        </Text>
      )}

      {/* RESUMEN */}
      {summary && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-lg border bg-white p-3">
            <Text size="xs" className="text-gray-500">
              Cartera total
            </Text>
            <Text font="bold" className="text-red-600">
              {money(summary.outstanding)}
            </Text>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <Text size="xs" className="text-gray-500">
              Vencido
            </Text>
            <Text font="bold">{money(summary.overdue)}</Text>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <Text size="xs" className="text-gray-500">
              Intereses de mora
            </Text>
            <Text font="bold">{money(summary.mora)}</Text>
          </div>

          {/*
            Consignado y sin verificar: no es deuda del residente, pero explica
            parte del saldo que la administración ve pendiente.
          */}
          <div className="rounded-lg border bg-white p-3">
            <Text size="xs" className="text-gray-500">
              Por verificar
            </Text>
            <Text font="bold" className="text-blue-600">
              {money(summary.inReview)}
            </Text>
          </div>

          <div className="rounded-lg border bg-white p-3">
            <Text size="xs" className="text-gray-500">
              Unidades con deuda
            </Text>
            <Text font="bold">{summary.units}</Text>
          </div>
        </div>
      )}

      {/*
        COBRO JURÍDICO
        Cuánta plata ya está escalada y cuánta el conjunto debería revisar. Solo
        aparece cuando hay algo que mostrar: en un conjunto al día es una fila
        de ceros que no dice nada.
      */}
      {summary && (summary.legalCases > 0 || summary.legalCandidates > 0) && (
        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-3">
          <div>
            <Text size="xs" className="text-gray-600">
              En cobro jurídico
            </Text>
            <Text font="bold" className="text-red-700">
              {money(summary.inLegal)}{" "}
              <span className="text-sm font-normal">
                · {summary.legalCases} unidad(es)
              </span>
            </Text>
          </div>

          {summary.legalCandidates > 0 && (
            <div className="border-l border-red-200 pl-3">
              <Text size="xs" className="text-gray-600">
                Candidatas a traslado
                {summary.legalThresholdDays
                  ? ` (+${summary.legalThresholdDays} días)`
                  : ""}
              </Text>
              <Text font="bold" className="text-amber-700">
                {summary.legalCandidates}
              </Text>
            </div>
          )}

          <Button
            colVariant="default"
            rounded="md"
            className="ml-auto"
            onClick={() => router.push(route.feesLegal)}
          >
            Ver casos
          </Button>
        </div>
      )}

      {/* ANTIGÜEDAD */}
      {summary && (
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            { label: "Hasta 30 días", value: summary.aging.current },
            { label: "31-60 días", value: summary.aging.days30 },
            { label: "61-90 días", value: summary.aging.days60 },
            { label: "91-120 días", value: summary.aging.days90 },
            { label: "+120 días", value: summary.aging.days90plus },
          ].map((bucket) => (
            <div key={bucket.label} className="rounded-lg border bg-gray-50 p-2">
              <Text size="xs" className="text-gray-500">
                {bucket.label}
              </Text>
              <Text size="sm" font="semi">
                {money(bucket.value)}
              </Text>
            </div>
          ))}
        </div>
      )}

      {/* FILTROS Y ACCIONES */}
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="min-w-[220px] flex-1">
          <InputField
            regexType="safeChars"
            placeholder="Buscar por apartamento o residente..."
            helpText="Buscar"
            prefixElement={<IoSearchCircle size={15} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="min-w-[160px]">
          <SelectField
            defaultOption="Todas las torres"
            helpText="Torre"
            sizeHelp="xs"
            options={(data?.towers ?? []).map((item) => ({
              label: item,
              value: item,
            }))}
            value={tower}
            onChange={(e) => setTower(e.target.value)}
          />
        </div>

        <div className="min-w-[170px]">
          <SelectField
            defaultOption="Toda la cartera"
            helpText="Antigüedad"
            sizeHelp="xs"
            options={AGING_OPTIONS.filter((option) => option.value)}
            value={minDays}
            onChange={(e) => setMinDays(e.target.value)}
          />
        </div>

        <Button
          colVariant="default"
          rounded="md"
          onClick={exportCsv}
          disabled={!data?.units.length}
        >
          Exportar CSV
        </Button>

        <Button
          colVariant="primary"
          rounded="md"
          onClick={() => setBulkOpen(true)}
          disabled={!data?.units.length}
        >
          Gestión de cobro
        </Button>
      </div>

      {/* TABLA */}
      <div className="mt-4">
        {isLoading ? (
          <Text size="sm" className="text-gray-500">
            Cargando cartera...
          </Text>
        ) : !data?.units.length ? (
          <Text size="sm" className="text-gray-500">
            No hay unidades con deuda para este filtro.
          </Text>
        ) : (
          <Table
            headers={headers}
            rows={rows}
            cellClasses={cellClasses}
            columnWidths={[
              "9%",
              "15%",
              "11%",
              "10%",
              "9%",
              "9%",
              "6%",
              "10%",
              "9%",
              "12%",
            ]}
          />
        )}
      </div>

      {/* GESTIÓN MASIVA */}
      <Modal
        isOpen={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Gestión de cobro"
      >
        <div className="flex flex-col gap-3 py-2">
          <Text size="sm" className="text-gray-600">
            Se enviará un recordatorio con el saldo al día a cada unidad que
            cumpla el filtro.
          </Text>

          {/*
            El tramo es obligatorio a propósito: sin él se le escribiría a todo
            el que deba un peso, incluida la cuota que se venció ayer.
          */}
          <Badge size="sm" colVariant="warning" rounded="lg">
            {minDays
              ? `${data?.units.length ?? 0} unidad(es) con más de ${
                  Number(minDays) - 1
                } días de mora`
              : "Elige un tramo de antigüedad antes de enviar"}
          </Badge>

          <textarea
            value={bulkNote}
            onChange={(e) => setBulkNote(e.target.value)}
            rows={3}
            placeholder="Mensaje adicional (opcional)"
            className="w-full rounded-md border p-3 text-sm"
          />

          <div className="flex justify-end gap-2">
            <Button
              colVariant="default"
              rounded="md"
              onClick={() => setBulkOpen(false)}
              disabled={remindAll.isPending}
            >
              Cancelar
            </Button>

            <Button
              colVariant="primary"
              rounded="md"
              disabled={!minDays || remindAll.isPending}
              onClick={() =>
                remindAll.mutate(
                  {
                    minDaysOverdue: Number(minDays),
                    tower: tower || undefined,
                    note: bulkNote.trim() || undefined,
                  },
                  {
                    onSuccess: () => {
                      setBulkOpen(false);
                      setBulkNote("");
                    },
                  },
                )
              }
            >
              {remindAll.isPending ? "Enviando..." : "Enviar recordatorios"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* TRASLADO A COBRO JURÍDICO */}
      <TransferToLegalModal
        unit={transferring}
        onClose={() => setTransferring(null)}
      />
    </div>
  );
}

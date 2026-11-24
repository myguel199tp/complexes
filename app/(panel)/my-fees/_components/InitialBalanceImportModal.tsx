"use client";

import React, { useRef, useState } from "react";
import { read, utils, writeFileXLSX } from "xlsx";
import { Modal, Text } from "complexes-next-components";
import { Button } from "@/app/components/ui/form";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiDownload,
  FiUpload,
  FiXCircle,
} from "react-icons/fi";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useInitialBalanceImportMutation } from "./use-initial-balance-import-mutation";
import {
  initialBalanceUnitsService,
  InitialBalanceImportResult,
  InitialBalanceImportRow,
  InitialBalanceImportSummary,
  MAX_INITIAL_BALANCE_ROWS,
} from "../services/initialBalanceImportService";

type Field = "tower" | "apartment" | "amount";

const HEADERS: Record<Field, string> = {
  tower: "Torre",
  apartment: "Apartamento*",
  amount: "Saldo*",
};

/**
 * Encabezados que se aceptan, ya normalizados. Además de la plantilla, el
 * archivo puede ser el reporte de cartera de la plataforma anterior con las
 * columnas renombradas a mano, y ahí cada quien escribe "Apto" o "Deuda".
 */
const ALIASES: Record<Field, string[]> = {
  tower: ["torre", "bloque", "interior", "tower"],
  apartment: [
    "apartamento",
    "apto",
    "apt",
    "unidad",
    "casa",
    "inmueble",
    "apartment",
  ],
  amount: ["saldo", "saldo inicial", "valor", "deuda", "monto", "amount"],
};

const STATUS_LABEL: Record<InitialBalanceImportResult["status"], string> = {
  created: "Cargado",
  skipped: "Omitido",
  failed: "Error",
};

// Lo que falló primero: es lo que hay que corregir.
const STATUS_ORDER: Record<InitialBalanceImportResult["status"], number> = {
  failed: 0,
  skipped: 1,
  created: 2,
};

/** Minúsculas, sin tildes, sin "*" ni texto entre paréntesis. */
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function bogotaToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

const pesos = (value: number) =>
  value.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });

const cell = (value: unknown) =>
  value === null || value === undefined ? "" : String(value).trim();

/**
 * Filas del Excel con su número real de fila. El saldo se manda crudo: si la
 * celda es número va como número y si es texto ("$ 1.200.000") lo interpreta
 * el backend, que es quien explica en cada fila por qué no lo pudo leer.
 */
function parseSheet(
  rows: Record<string, unknown>[],
): { rows: InitialBalanceImportRow[] } | { error: string } {
  if (!rows.length) return { error: "El archivo no trae filas." };

  const columns: Partial<Record<Field, string>> = {};

  for (const header of Object.keys(rows[0])) {
    const key = normalize(header);
    for (const field of Object.keys(ALIASES) as Field[]) {
      if (!columns[field] && ALIASES[field].includes(key)) {
        columns[field] = header;
      }
    }
  }

  if (!columns.apartment || !columns.amount) {
    return {
      error:
        'No encontré las columnas "Apartamento" y "Saldo". Usa la plantilla o renombra los encabezados.',
    };
  }

  const parsed = rows
    .map((row, index) => {
      // SheetJS deja en cada fila su posición en la hoja (base 0).
      const rowNum = (row as { __rowNum__?: number }).__rowNum__;
      const rawAmount = row[columns.amount!];

      return {
        row: typeof rowNum === "number" ? rowNum + 1 : index + 2,
        tower: columns.tower ? cell(row[columns.tower]) : "",
        apartment: cell(row[columns.apartment!]),
        amount:
          typeof rawAmount === "number" ? rawAmount : cell(rawAmount),
      };
    })
    .filter((row) => row.tower || row.apartment || row.amount !== "");

  if (!parsed.length) return { error: "El archivo no trae filas con datos." };

  if (parsed.length > MAX_INITIAL_BALANCE_ROWS) {
    return {
      error: `El archivo tiene ${parsed.length} filas y el máximo es ${MAX_INITIAL_BALANCE_ROWS}. Divídelo por torres.`,
    };
  }

  return {
    rows: parsed.map((row) => ({
      ...row,
      tower: row.tower || undefined,
      apartment: row.apartment || undefined,
    })),
  };
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Saldos iniciales de todo el conjunto desde un Excel, para quien llega de
 * otra plataforma. Antes se cargaban apartamento por apartamento, y sin saldo
 * inicial no se le puede asignar ninguna otra cuota a la unidad.
 */
export default function InitialBalanceImportModal({ isOpen, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const mutation = useInitialBalanceImportMutation();

  const today = bogotaToday();
  const [cutoffDate, setCutoffDate] = useState(today);
  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<InitialBalanceImportRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [summary, setSummary] = useState<InitialBalanceImportSummary | null>(
    null,
  );
  const [loadingTemplate, setLoadingTemplate] = useState(false);

  const isPastCutoff = !!cutoffDate && cutoffDate < today;
  const validCutoff = !!cutoffDate && cutoffDate <= today;

  const handleDownloadTemplate = async () => {
    setLoadingTemplate(true);

    try {
      const units = await initialBalanceUnitsService(conjuntoId);
      const pending = units.filter((unit) => !unit.hasInitialBalance);

      const ws = utils.aoa_to_sheet([
        [HEADERS.tower, HEADERS.apartment, HEADERS.amount],
        ...pending.map((unit) => [unit.tower, unit.apartment, ""]),
      ]);
      ws["!cols"] = [{ wch: 14 }, { wch: 16 }, { wch: 16 }];

      const wb = utils.book_new();
      utils.book_append_sheet(wb, ws, "Saldos");
      writeFileXLSX(wb, "plantilla_saldos_iniciales.xlsx");

      if (!units.length) {
        showAlert(
          "Todavía no hay unidades registradas: la plantilla va vacía. Registra primero a los propietarios.",
          "info",
        );
      } else if (!pending.length) {
        showAlert("Todas las unidades ya tienen saldo inicial.", "info");
      }
    } catch (error) {
      showAlert(
        error instanceof Error
          ? error.message
          : "No se pudo descargar la plantilla",
        "error",
      );
    } finally {
      setLoadingTemplate(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setParseError(null);
    setSummary(null);
    setRows([]);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = read(ev.target?.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const result = parseSheet(
          utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" }),
        );

        if ("error" in result) {
          setParseError(result.error);
          return;
        }

        setRows(result.rows);
      } catch {
        setParseError("No se pudo leer el archivo. Verifica que sea un .xlsx.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = () => {
    mutation.mutate(
      { cutoffDate, rows },
      { onSuccess: (data) => setSummary(data) },
    );
  };

  const handleClose = () => {
    setRows([]);
    setFileName(null);
    setParseError(null);
    setSummary(null);
    setCutoffDate(bogotaToday());
    if (fileRef.current) fileRef.current.value = "";
    onClose();
  };

  const statusIcon = (status: InitialBalanceImportResult["status"]) => {
    if (status === "created")
      return <FiCheckCircle className="mr-1 inline text-green-600" />;
    if (status === "skipped")
      return <FiAlertCircle className="mr-1 inline text-amber-500" />;
    return <FiXCircle className="mr-1 inline text-red-500" />;
  };

  const sortedResults = summary
    ? [...summary.results].sort(
        (a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.row - b.row,
      )
    : [];

  return (
    <Modal
      className="w-11/12 max-w-lg max-h-[88vh] overflow-y-auto"
      isOpen={isOpen}
      onClose={handleClose}
      title="Saldos iniciales por Excel"
    >
      <div className="flex min-w-[280px] flex-col gap-4">
        <Text size="xs" className="text-gray-600">
          Es lo que debía cada unidad en la plataforma anterior. Escribe 0 si
          la unidad está al día. A los residentes no les llega aviso: lo ven en
          su estado de cuenta.
        </Text>

        {!summary && (
          <>
            <div className="flex flex-col gap-1">
              <Text size="sm" font="bold">
                1. Descarga la plantilla
              </Text>
              <Text size="xs" className="text-gray-600">
                Viene con las torres y apartamentos tal como están registrados;
                solo escribe el saldo de cada uno.
              </Text>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={loadingTemplate || !conjuntoId}
                className="flex w-fit items-center gap-2 text-sm text-blue-600 hover:underline disabled:opacity-50"
              >
                <FiDownload />
                {loadingTemplate ? "Preparando..." : "Descargar plantilla Excel"}
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="initial-balance-cutoff"
                className="text-sm font-bold text-gray-900"
              >
                2. Fecha de corte de los saldos
              </label>
              <Text size="xs" className="text-gray-600">
                El día en que se midieron, normalmente el último cierre de la
                plataforma anterior. Aplica a todo el archivo.
              </Text>
              <input
                id="initial-balance-cutoff"
                type="date"
                value={cutoffDate}
                max={today}
                onChange={(e) => setCutoffDate(e.target.value)}
                className="w-fit rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-900"
              />
              {!validCutoff && (
                <Text size="xs" className="text-red-600">
                  La fecha de corte no puede ser futura.
                </Text>
              )}
              {isPastCutoff && (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-2">
                  <Text size="xs" className="text-amber-800">
                    Si el conjunto cobra intereses de mora, corren desde esta
                    fecha: la primera liquidación incluirá los días que ya
                    pasaron.
                  </Text>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1">
              <Text size="sm" font="bold">
                3. Sube el archivo completado
              </Text>
              <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-gray-300 p-3 hover:bg-gray-50">
                <FiUpload className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  {fileName ?? "Seleccionar archivo .xlsx"}
                </span>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
              {parseError && (
                <Text size="xs" className="text-red-600">
                  {parseError}
                </Text>
              )}
            </div>

            {rows.length > 0 && (
              <div className="flex flex-col gap-2">
                <Text size="sm" font="bold">
                  {rows.length} unidad(es) en el archivo
                </Text>
                <div className="max-h-40 overflow-auto rounded-lg border border-gray-200">
                  <table className="w-full text-xs text-gray-900">
                    <thead className="sticky top-0 bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 text-left">Fila</th>
                        <th className="px-2 py-1 text-left">Unidad</th>
                        <th className="px-2 py-1 text-right">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.row} className="border-t border-gray-100">
                          <td className="px-2 py-1">{row.row}</td>
                          <td className="px-2 py-1">
                            {[row.tower, row.apartment]
                              .filter(Boolean)
                              .join(" - ") || "—"}
                          </td>
                          <td className="px-2 py-1 text-right">
                            {typeof row.amount === "number"
                              ? pesos(row.amount)
                              : row.amount || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  size="sm"
                  onClick={handleSubmit}
                  disabled={mutation.isPending || !validCutoff}
                  loading={mutation.isPending}
                >
                  {mutation.isPending ? "Cargando..." : "Cargar saldos"}
                </Button>
              </div>
            )}
          </>
        )}

        {summary && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm font-semibold">
              <span className="text-green-700">{summary.created} cargados</span>
              <span className="text-amber-600">{summary.skipped} omitidos</span>
              <span className="text-red-600">{summary.failed} con error</span>
            </div>
            <Text size="xs" className="text-gray-600">
              Total cargado: {pesos(summary.createdAmount)}
            </Text>
            {summary.failed > 0 && (
              <Text size="xs" className="text-gray-600">
                Corrige las filas con error y vuelve a subir el mismo archivo:
                las unidades que ya quedaron cargadas se omiten.
              </Text>
            )}
            <div className="max-h-60 overflow-auto rounded-lg border border-gray-200">
              <table className="w-full text-xs text-gray-900">
                <thead className="sticky top-0 bg-gray-100">
                  <tr>
                    <th className="px-2 py-1 text-left">Fila</th>
                    <th className="px-2 py-1 text-left">Unidad</th>
                    <th className="px-2 py-1 text-left">Estado</th>
                    <th className="px-2 py-1 text-left">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedResults.map((result) => (
                    <tr key={result.row} className="border-t border-gray-100">
                      <td className="px-2 py-1">{result.row}</td>
                      <td className="px-2 py-1">{result.unit}</td>
                      <td className="whitespace-nowrap px-2 py-1">
                        {statusIcon(result.status)}
                        {STATUS_LABEL[result.status]}
                      </td>
                      <td className="px-2 py-1 text-gray-600">
                        {result.status === "created" &&
                        typeof result.amount === "number"
                          ? pesos(result.amount)
                          : (result.reason ?? "—")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button size="sm" colVariant="danger" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}

"use client";

import React, { useRef, useState } from "react";
import { read, utils, writeFileXLSX } from "xlsx";
import { useMutation } from "@tanstack/react-query";
import { Modal, Text } from "complexes-next-components";
import { FiDownload, FiUpload } from "react-icons/fi";

import { Button } from "@/app/components/ui/form";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  BulkParkingSpotItem,
  BulkParkingSpotSummary,
  bulkCreateParkingSpots,
  MAX_BULK_SPOTS,
  PARKING_SPOT_TYPES,
  ParkingSpotType,
} from "../services/parkingSpotService";

const TEMPLATE_HEADERS = [
  "Código* (ej. A-45)",
  "Zona o sótano",
  "Tipo (Residente, Visitante, Moto o Movilidad reducida)",
];

/**
 * Nombres que se aceptan para cada columna, ya normalizados (ver
 * `normalize`). Los mismos que reconoce Lary cuando le mandan el Excel.
 */
const COLUMNS = {
  code: ["codigo", "codigo de la celda", "celda", "code"],
  zone: ["zona o sotano", "zona", "sotano", "zone"],
  type: ["tipo", "tipo de celda", "type"],
} as const;

const TYPE_ALIASES: Record<string, ParkingSpotType> = {
  residente: "resident",
  residentes: "resident",
  propietario: "resident",
  visitante: "visitor",
  visitantes: "visitor",
  visita: "visitor",
  visitas: "visitor",
  moto: "motorcycle",
  motos: "motorcycle",
  motocicleta: "motorcycle",
  "movilidad reducida": "disabled",
  discapacidad: "disabled",
  discapacitados: "disabled",
  pmr: "disabled",
};

const TYPE_LABEL = Object.fromEntries(
  PARKING_SPOT_TYPES.map((t) => [t.value, t.label]),
) as Record<ParkingSpotType, string>;

/** Minúsculas, sin tildes, sin "*" ni la ayuda entre paréntesis. */
function normalize(text: unknown) {
  return String(text ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\*/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

interface RejectedRow {
  row: number;
  code: string;
  problems: string[];
}

/** Las filas del Excel: las que se pueden mandar y las que no, con su motivo. */
function parseRows(rows: Record<string, unknown>[]) {
  const ready: BulkParkingSpotItem[] = [];
  const rejected: RejectedRow[] = [];
  const seen = new Set<string>();

  rows.forEach((raw, i) => {
    const cells = new Map(
      Object.entries(raw).map(([header, value]) => [normalize(header), value]),
    );
    const get = (key: keyof typeof COLUMNS) => {
      const found = COLUMNS[key].find((name) => cells.has(name));
      return found ? String(cells.get(found) ?? "").trim() : "";
    };

    const code = get("code");
    const zone = get("zone");
    const rawType = get("type");
    // La fila 1 del Excel es la cabecera.
    const row = i + 2;

    if (!code && !zone && !rawType) return;

    const type: ParkingSpotType | undefined = rawType
      ? TYPE_ALIASES[normalize(rawType)]
      : "resident";
    const problems: string[] = [];

    if (!code) problems.push("falta el código");
    if (code.length > 30) problems.push("el código pasa de 30 caracteres");
    if (zone.length > 60) problems.push("la zona pasa de 60 caracteres");
    if (!type) problems.push(`tipo «${rawType}» no existe`);

    const key = code.toUpperCase();
    if (code && seen.has(key)) problems.push("repetida en el archivo");
    seen.add(key);

    if (problems.length) {
      rejected.push({ row, code: code || "sin código", problems });
      return;
    }

    ready.push({ row, code, zone: zone || undefined, type });
  });

  return { ready, rejected };
}

interface Props {
  conjuntoId: string;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Carga del inventario de celdas por Excel.
 *
 * El archivo se lee aquí y se mandan las filas: es lo mismo que hace el
 * registro masivo de propietarios. Lo que se puede revisar sin la base
 * (código, tipo, repetidas) se señala antes de enviar; lo que ya existe en el
 * inventario lo omite el backend.
 */
export default function ParkingBulkModal({ conjuntoId, isOpen, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const showAlert = useAlertStore((s) => s.showAlert);
  const [fileName, setFileName] = useState("");
  const [ready, setReady] = useState<BulkParkingSpotItem[]>([]);
  const [rejected, setRejected] = useState<RejectedRow[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [summary, setSummary] = useState<BulkParkingSpotSummary | null>(null);

  const mutation = useMutation({
    mutationFn: () => bulkCreateParkingSpots(conjuntoId, ready),
    onSuccess: (data) => {
      setSummary(data);
      showAlert(
        `Carga de celdas: ${data.created} creadas, ${data.skipped} omitidas, ${data.failed} con error`,
        data.failed > 0 ? "error" : "success",
      );
    },
    onError: (e: Error) => showAlert(e.message || "No se pudieron cargar las celdas", "error"),
  });

  const reset = () => {
    setFileName("");
    setReady([]);
    setRejected([]);
    setParseError(null);
    setSummary(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const downloadTemplate = () => {
    const ws = utils.aoa_to_sheet([
      TEMPLATE_HEADERS,
      ["A-1", "Sótano 1", "Residente"],
      ["V-1", "Plataforma", "Visitante"],
    ]);
    ws["!cols"] = TEMPLATE_HEADERS.map((h) => ({ wch: Math.min(h.length + 2, 40) }));
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Celdas");
    writeFileXLSX(wb, "plantilla_celdas_parqueadero.xlsx");
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setSummary(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = read(ev.target?.result, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = utils.sheet_to_json<Record<string, unknown>>(ws, {
          defval: "",
          raw: false,
        });
        const parsed = parseRows(rows);

        if (!parsed.ready.length && !parsed.rejected.length) {
          setParseError("No encontré celdas. Usa la plantilla: la columna «Código» es obligatoria.");
          return;
        }

        if (parsed.ready.length > MAX_BULK_SPOTS) {
          setParseError(`El archivo trae ${parsed.ready.length} celdas y el máximo es ${MAX_BULK_SPOTS}. Pártelo en varios.`);
          return;
        }

        setReady(parsed.ready);
        setRejected(parsed.rejected);
      } catch {
        setParseError("No pude leer el archivo. Verifica que sea un .xlsx válido.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const notCreated = summary?.results.filter((r) => r.status !== "created") ?? [];

  return (
    <Modal
      className="w-11/12 max-w-md max-h-[88vh] overflow-y-auto"
      isOpen={isOpen}
      onClose={handleClose}
      title="Cargar celdas con Excel"
    >
      <div className="flex min-w-0 flex-col gap-4">
        <Text size="xs" className="text-slate-600 dark:text-slate-400">
          Una fila por celda. Las que ya existan en el inventario se omiten, así
          que puedes volver a subir el archivo después de corregirlo. También
          puedes mandárselo a Lary por el chat con 📎.
        </Text>

        <div className="flex flex-col gap-1">
          <Text size="sm" font="bold" className="text-slate-800 dark:text-white">
            1. Descarga la plantilla
          </Text>
          <button
            type="button"
            onClick={downloadTemplate}
            className="flex w-fit items-center gap-2 text-sm text-cyan-700 hover:underline dark:text-cyan-300"
          >
            <FiDownload />
            Descargar plantilla Excel
          </button>
        </div>

        <div className="flex flex-col gap-1">
          <Text size="sm" font="bold" className="text-slate-800 dark:text-white">
            2. Sube el archivo completado
          </Text>
          <label className="flex w-fit max-w-full cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 p-3 hover:bg-slate-50 dark:border-white/15 dark:hover:bg-white/[0.04]">
            <FiUpload className="shrink-0 text-slate-500" />
            <span className="truncate text-sm text-slate-600 dark:text-slate-300">
              {fileName || "Seleccionar archivo .xlsx"}
            </span>
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={handleFile}
            />
          </label>
          {parseError ? (
            <Text size="xs" className="text-red-600 dark:text-red-400">
              {parseError}
            </Text>
          ) : null}
        </div>

        {(ready.length > 0 || rejected.length > 0) && !summary ? (
          <div className="flex flex-col gap-2">
            <Text size="sm" font="bold" className="text-slate-800 dark:text-white">
              {ready.length} celda(s) listas para crear
            </Text>
            {ready.length > 0 ? (
              <ul className="max-h-40 overflow-auto rounded-lg border border-slate-200 text-xs dark:border-white/10">
                {ready.map((spot) => (
                  <li
                    key={spot.row}
                    className="flex justify-between gap-2 border-t border-slate-100 px-2 py-1 first:border-t-0 dark:border-white/5"
                  >
                    <span className="min-w-0 truncate font-semibold text-slate-800 dark:text-slate-100">
                      {spot.code}
                      {spot.zone ? (
                        <span className="ml-2 font-normal text-slate-500">{spot.zone}</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 text-slate-600 dark:text-slate-400">
                      {TYPE_LABEL[spot.type ?? "resident"]}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            {rejected.length > 0 ? (
              <div className="flex flex-col gap-1 rounded-lg border border-amber-300 bg-amber-50 p-2 dark:border-amber-500/40 dark:bg-amber-500/10">
                <Text size="xs" font="bold" className="text-amber-800 dark:text-amber-200">
                  {rejected.length} fila(s) no se cargarán
                </Text>
                <ul className="max-h-24 overflow-auto text-xs text-amber-900 dark:text-amber-100">
                  {rejected.map((r) => (
                    <li key={r.row}>
                      Fila {r.row} ({r.code}): {r.problems.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <Button
              size="sm"
              rounded="md"
              colVariant="success"
              onClick={() => mutation.mutate()}
              disabled={mutation.isPending || ready.length === 0}
            >
              {mutation.isPending ? "Creando..." : "Crear celdas"}
            </Button>
          </div>
        ) : null}

        {summary ? (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <span className="text-emerald-700 dark:text-emerald-300">{summary.created} creadas</span>
              <span className="text-amber-700 dark:text-amber-300">{summary.skipped} omitidas</span>
              <span className="text-red-600 dark:text-red-400">{summary.failed} con error</span>
            </div>
            {notCreated.length > 0 ? (
              <ul className="max-h-52 overflow-auto rounded-lg border border-slate-200 text-xs dark:border-white/10">
                {notCreated.map((r, i) => (
                  <li
                    key={`${r.code}-${i}`}
                    className="border-t border-slate-100 px-2 py-1 text-slate-700 first:border-t-0 dark:border-white/5 dark:text-slate-300"
                  >
                    {r.row ? `Fila ${r.row} · ` : ""}
                    <span className="font-semibold">{r.code}</span>: {r.reason ?? r.status}
                  </li>
                ))}
              </ul>
            ) : null}
            <Button size="sm" rounded="md" onClick={handleClose}>
              Cerrar
            </Button>
          </div>
        ) : null}
      </div>
    </Modal>
  );
}

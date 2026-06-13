"use client";

import React, { useRef, useState } from "react";
import { Modal, Text, Button } from "complexes-next-components";
import { read, utils, writeFileXLSX } from "xlsx";
import { useBulkRegisterMutation } from "../use-bulk-register-mutation";
import {
  BulkRegisterUserItem,
  BulkRegisterSummary,
} from "../../services/bulkRegisterService";
import {
  FiDownload,
  FiUpload,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
} from "react-icons/fi";

const TEMPLATE_COLUMNS = [
  "name",
  "lastName",
  "email",
  "numberId",
  "phone",
  "indicative",
  "country",
  "city",
  "bornDate",
  "roles",
  "tower",
  "apartment",
  "plaque",
  "coefficient",
  "isMainResidence",
  "pet",
  "council",
];

const COLUMN_LABELS: Record<string, string> = {
  name: "Nombre*",
  lastName: "Apellido*",
  email: "Email*",
  numberId: "Documento",
  phone: "Teléfono",
  indicative: "Indicativo",
  country: "País",
  city: "Ciudad",
  bornDate: "Fecha nacimiento (YYYY-MM-DD)",
  roles: "Roles (owner/tenant/resident...)",
  tower: "Torre",
  apartment: "Apartamento",
  plaque: "Placa",
  coefficient: "Coeficiente",
  isMainResidence: "Residencia principal (true/false)",
  pet: "Mascota (true/false)",
  council: "Consejo (true/false)",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function parseRow(row: Record<string, unknown>): BulkRegisterUserItem {
  const get = (key: string) => {
    const val = row[key] ?? row[COLUMN_LABELS[key]] ?? "";
    return val !== undefined && val !== null ? String(val).trim() : "";
  };

  const roles = get("roles")
    ? get("roles")
        .split(",")
        .map((r) => r.trim())
        .filter(Boolean)
    : ["owner"];

  return {
    name: get("name"),
    lastName: get("lastName"),
    email: get("email"),
    numberId: get("numberId") || undefined,
    phone: get("phone") || undefined,
    indicative: get("indicative") || undefined,
    country: get("country") || undefined,
    city: get("city") || undefined,
    bornDate: get("bornDate") || undefined,
    roles,
    tower: get("tower") || undefined,
    apartment: get("apartment") || undefined,
    plaque: get("plaque") || undefined,
    coefficient: get("coefficient") ? Number(get("coefficient")) : undefined,
    isMainResidence:
      get("isMainResidence") !== ""
        ? get("isMainResidence").toLowerCase() !== "false"
        : undefined,
    pet: get("pet") !== "" ? get("pet").toLowerCase() === "true" : undefined,
    council:
      get("council") !== ""
        ? get("council").toLowerCase() === "true"
        : undefined,
  };
}

export default function BulkRegisterModal({ isOpen, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState<BulkRegisterUserItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [summary, setSummary] = useState<BulkRegisterSummary | null>(null);
  const mutation = useBulkRegisterMutation();

  const handleDownloadTemplate = () => {
    const ws = utils.aoa_to_sheet([TEMPLATE_COLUMNS, []]);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Usuarios");
    writeFileXLSX(wb, "plantilla_registro_masivo.xlsx");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParseError(null);
    setSummary(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = ev.target?.result;
        const wb = read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = utils.sheet_to_json<Record<string, unknown>>(ws, {
          defval: "",
        });

        const parsed = rows
          .map(parseRow)
          .filter((u) => u.name && u.lastName && u.email);

        if (!parsed.length) {
          setParseError(
            "No se encontraron filas válidas. Asegúrate de usar la plantilla correcta.",
          );
          return;
        }

        setUsers(parsed);
      } catch {
        setParseError(
          "Error al leer el archivo. Verifica que sea un .xlsx válido.",
        );
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSubmit = () => {
    mutation.mutate(
      { users },
      {
        onSuccess: (data) => setSummary(data),
      },
    );
  };

  const handleClose = () => {
    setUsers([]);
    setParseError(null);
    setSummary(null);
    if (fileRef.current) fileRef.current.value = "";
    onClose();
  };

  const statusIcon = (status: string) => {
    if (status === "created")
      return <FiCheckCircle className="text-green-500 inline mr-1" />;
    if (status === "skipped")
      return <FiAlertCircle className="text-yellow-500 inline mr-1" />;
    return <FiXCircle className="text-red-500 inline mr-1" />;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Registro masivo de usuarios"
    >
      <div className="flex flex-col gap-4 min-w-[300px] max-w-[600px]">
        {/* Step 1: download template */}
        <div className="flex flex-col gap-1">
          <Text size="sm" font="bold">
            1. Descarga la plantilla
          </Text>
          <button
            onClick={handleDownloadTemplate}
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline w-fit"
          >
            <FiDownload />
            Descargar plantilla Excel
          </button>
        </div>

        {/* Step 2: upload file */}
        <div className="flex flex-col gap-1">
          <Text size="sm" font="bold">
            2. Sube el archivo completado
          </Text>
          <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-lg p-3 hover:bg-gray-50 w-fit">
            <FiUpload className="text-gray-500" />
            <span className="text-sm text-gray-600">
              {fileRef.current?.files?.[0]?.name ?? "Seleccionar archivo .xlsx"}
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
            <Text size="xs" className="text-red-500">
              {parseError}
            </Text>
          )}
        </div>

        {/* Preview */}
        {users.length > 0 && !summary && (
          <div className="flex flex-col gap-2">
            <Text size="sm" font="bold">
              {users.length} usuario(s) listos para registrar
            </Text>
            <div className="max-h-40 overflow-y-auto border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left px-2 py-1">Nombre</th>
                    <th className="text-left px-2 py-1">Email</th>
                    <th className="text-left px-2 py-1">Apto</th>
                    <th className="text-left px-2 py-1">Roles</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1">
                        {u.name} {u.lastName}
                      </td>
                      <td className="px-2 py-1 truncate max-w-[120px]">
                        {u.email}
                      </td>
                      <td className="px-2 py-1">{u.apartment ?? "-"}</td>
                      <td className="px-2 py-1">{u.roles?.join(", ")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Registrando..." : "Registrar usuarios"}
            </Button>
          </div>
        )}

        {/* Results */}
        {summary && (
          <div className="flex flex-col gap-3">
            <div className="flex gap-4 text-sm font-semibold">
              <span className="text-green-600">{summary.created} creados</span>
              <span className="text-yellow-600">
                {summary.skipped} omitidos
              </span>
              <span className="text-red-600">{summary.failed} fallidos</span>
            </div>
            <div className="max-h-52 overflow-y-auto border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-100 sticky top-0">
                  <tr>
                    <th className="text-left px-2 py-1">Email</th>
                    <th className="text-left px-2 py-1">Estado</th>
                    <th className="text-left px-2 py-1">Detalle</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.results.map((r, i) => (
                    <tr key={i} className="border-t">
                      <td className="px-2 py-1 truncate max-w-[160px]">
                        {r.email}
                      </td>
                      <td className="px-2 py-1 whitespace-nowrap">
                        {statusIcon(r.status)}
                        {r.status}
                      </td>
                      <td className="px-2 py-1 text-gray-500">
                        {r.reason ?? "-"}
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

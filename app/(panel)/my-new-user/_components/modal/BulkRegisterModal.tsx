"use client";

import React, { useRef, useState } from "react";
import { read, utils, writeFileXLSX } from "xlsx";
import { Modal, Text } from "complexes-next-components";
import { Button } from "@/app/components/ui/form";
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

// Sin columna de rol: la carga por Excel es solo de propietarios (el backend
// rechaza cualquier otro rol). Las plantillas viejas sí la traen, y por eso se
// sigue leyendo: una fila con otro rol se avisa y no se manda.
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
  email: "Correo electrónico*",
  numberId: "Número de documento",
  phone: "Teléfono",
  indicative: "Indicativo (ej: +57)",
  country: "País",
  city: "Ciudad",
  bornDate: "Fecha de nacimiento (AAAA-MM-DD)",
  roles: "Roles",
  tower: "Torre",
  apartment: "Apartamento",
  plaque: "Placa",
  coefficient: "Coeficiente",
  isMainResidence: "Residencia principal (sí/no)",
  pet: "Mascota (sí/no)",
  council: "Consejo (sí/no)",
};

// Nombres en español que puede escribir la gente → valor que espera el backend
const ROLE_ALIASES: Record<string, string> = {
  propietario: "owner",
  arrendatario: "tenant",
  arrendado: "tenant",
  inquilino: "tenant",
  residente: "resident",
  familiar: "family",
  empleado: "employee",
  colaborador: "employee",
};

const ROLE_LABELS: Record<string, string> = {
  owner: "propietario",
  tenant: "arrendatario",
  resident: "residente",
  family: "familiar",
  employee: "administración",
};

/** Solo estas filas se mandan: el registro masivo es de propietarios. */
const isOwnerRow = (u: BulkRegisterUserItem) =>
  (u.roles ?? ["owner"]).every((role) => role === "owner");

const TRUE_VALUES = ["si", "true", "1", "x"];

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// Minúsculas, sin tildes, sin "*" ni el texto de ayuda entre paréntesis,
// para que "Nombre*", "nombre" o "NOMBRE" apunten a la misma columna.
function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\(.*?\)/g, "")
    .replace(/\*/g, "")
    .trim()
    .toLowerCase();
}

function parseRow(row: Record<string, unknown>): BulkRegisterUserItem {
  const cells = new Map(
    Object.entries(row).map(([header, val]) => [normalize(header), val]),
  );

  // Acepta la cabecera en español y la clave en inglés de plantillas antiguas
  const get = (key: string) => {
    const val =
      cells.get(normalize(COLUMN_LABELS[key])) ?? cells.get(normalize(key));
    return val !== undefined && val !== null ? String(val).trim() : "";
  };

  const isYes = (key: string) => TRUE_VALUES.includes(normalize(get(key)));

  const roles = get("roles")
    ? get("roles")
        .split(",")
        .map((r) => ROLE_ALIASES[normalize(r)] ?? r.trim().toLowerCase())
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
      get("isMainResidence") !== "" ? isYes("isMainResidence") : undefined,
    pet: get("pet") !== "" ? isYes("pet") : undefined,
    council: get("council") !== "" ? isYes("council") : undefined,
  };
}

export default function BulkRegisterModal({ isOpen, onClose }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [users, setUsers] = useState<BulkRegisterUserItem[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [summary, setSummary] = useState<BulkRegisterSummary | null>(null);
  const mutation = useBulkRegisterMutation();

  const owners = users.filter(isOwnerRow);
  const notOwners = users.filter((u) => !isOwnerRow(u));

  const handleDownloadTemplate = () => {
    const headers = TEMPLATE_COLUMNS.map((key) => COLUMN_LABELS[key]);
    const ws = utils.aoa_to_sheet([headers, []]);
    ws["!cols"] = headers.map((label) => ({ wch: label.length + 2 }));
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
      { users: owners.map((u) => ({ ...u, roles: ["owner"] })) },
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
      className="w-11/12 max-w-md max-h-[88vh] overflow-y-auto"
      isOpen={isOpen}
      onClose={handleClose}
      title="Registro masivo de propietarios"
    >
      <div className="flex flex-col gap-4 min-w-[300px] max-w-[600px]">
        <Text size="xs" className="text-gray-600">
          La carga por Excel es solo para propietarios. Arrendatarios,
          familiares y personal se registran uno por uno.
        </Text>

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
              {owners.length} propietario(s) listos para registrar
            </Text>
            {owners.length > 0 && (
              <div className="max-h-40 overflow-auto border rounded-lg">
                <table className="w-full text-xs">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      <th className="text-left px-2 py-1">Nombre</th>
                      <th className="text-left px-2 py-1">Email</th>
                      <th className="text-left px-2 py-1">Apto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {owners.map((u, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-1">
                          {u.name} {u.lastName}
                        </td>
                        <td className="px-2 py-1 truncate max-w-[120px]">
                          {u.email}
                        </td>
                        <td className="px-2 py-1">{u.apartment ?? "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {notOwners.length > 0 && (
              <div className="flex flex-col gap-1 rounded-lg border border-amber-300 bg-amber-50 p-2">
                <Text size="xs" font="bold" className="text-amber-800">
                  {notOwners.length} fila(s) con otro rol no se cargarán
                </Text>
                <Text size="xs" className="text-amber-800">
                  Regístralas una por una desde &quot;Agregar usuario&quot;.
                </Text>
                <ul className="max-h-24 overflow-auto text-xs text-amber-900">
                  {notOwners.map((u, i) => (
                    <li key={i}>
                      {u.name} {u.lastName} ({u.email}):{" "}
                      {(u.roles ?? [])
                        .map((role) => ROLE_LABELS[role] ?? role)
                        .join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <Button
              size="sm"
              onClick={handleSubmit}
              disabled={mutation.isPending || owners.length === 0}
            >
              {mutation.isPending ? "Registrando..." : "Registrar propietarios"}
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
            <div className="max-h-52 overflow-auto border rounded-lg">
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

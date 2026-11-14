"use client";

import React from "react";
import Link from "next/link";
import { modal as m } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { useProviderQuery } from "@/app/(panel)/my-maintenace/maintenance/_components/use-provider-query";
import { route } from "@/app/_domain/constants/routes";
import type {
  EmploymentInput,
  EmploymentType,
  StaffMember,
} from "../../services/staffService";

/** En la lista de empresas: la que no está en Proveedores y se escribe. */
export const OTHER_COMPANY = "__other__";

export interface EmploymentDraft {
  type: EmploymentType | "";
  /** Un proveedor del conjunto, `OTHER_COMPANY` o "" si aún no se elige. */
  providerId: string;
  /** Solo con `OTHER_COMPANY`. */
  companyName: string;
}

export const EMPTY_EMPLOYMENT: EmploymentDraft = {
  type: "",
  providerId: "",
  companyName: "",
};

export function draftFromMember(
  employment: StaffMember["employment"] | undefined,
): EmploymentDraft {
  if (employment?.type === "external") {
    return employment.providerId
      ? { type: "external", providerId: employment.providerId, companyName: "" }
      : {
          type: "external",
          providerId: OTHER_COMPANY,
          companyName: employment.companyName ?? "",
        };
  }
  return { ...EMPTY_EMPLOYMENT, type: employment?.type ?? "" };
}

/** Lo que falta para poder guardar, o `null`. */
export function employmentError(draft: EmploymentDraft): string | null {
  if (!draft.type) {
    return "Indica si tiene contrato directo con el conjunto o si viene de una empresa.";
  }
  if (draft.type === "direct") return null;
  if (!draft.providerId) return "Elige la empresa que lo contrata.";
  if (
    draft.providerId === OTHER_COMPANY &&
    draft.companyName.trim().length < 2
  ) {
    return "Escribe el nombre de la empresa que lo contrata.";
  }
  return null;
}

export function toEmploymentInput(
  draft: EmploymentDraft,
): EmploymentInput | null {
  if (employmentError(draft)) return null;
  if (draft.type === "direct") return { type: "direct" };
  return draft.providerId === OTHER_COMPANY
    ? { type: "external", companyName: draft.companyName.trim() }
    : { type: "external", providerId: draft.providerId };
}

const CHOICES: { type: EmploymentType; title: string; hint: string }[] = [
  {
    type: "direct",
    title: "Contrato directo",
    hint: "El conjunto lo contrata y le paga.",
  },
  {
    type: "external",
    title: "Empresa externa",
    hint: "Lo pone una empresa: vigilancia, aseo, la administradora…",
  },
];

interface Props {
  value: EmploymentDraft;
  onChange: (next: EmploymentDraft) => void;
  /** Se muestra debajo; `null` mientras no se haya intentado guardar. */
  error?: string | null;
  disabled?: boolean;
}

/**
 * Contrato directo o empresa externa, y cuál. La empresa sale de los
 * proveedores del conjunto; si no está, se escribe el nombre.
 *
 * Va siempre sobre fondo blanco (el modal y las tarjetas del formulario de
 * alta): colores `modal.*`, sin variantes oscuras.
 */
export default function EmploymentFields({
  value,
  onChange,
  error,
  disabled,
}: Props) {
  const { data: providers, isLoading } = useProviderQuery();

  // Los inactivos no se ofrecen, salvo el que ya tiene: si no, el select
  // quedaría vacío y parecería que se perdió la empresa.
  const options = (providers ?? []).filter(
    (p) => p.isActive || p.id === value.providerId,
  );

  const chooseType = (type: EmploymentType) => {
    if (type === value.type) return;
    onChange({
      type,
      // Sin proveedores registrados solo queda escribir el nombre.
      providerId:
        type === "external" && !isLoading && options.length === 0
          ? OTHER_COMPANY
          : "",
      companyName: "",
    });
  };

  return (
    <div className="space-y-3">
      <div
        role="radiogroup"
        aria-label="Tipo de contratación"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        {CHOICES.map((choice) => {
          const selected = value.type === choice.type;
          return (
            <label
              key={choice.type}
              className={`block cursor-pointer rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-cyan-500/40 ${
                selected
                  ? "border-cyan-600 bg-cyan-50"
                  : "border-slate-200 bg-white hover:bg-slate-50"
              } ${disabled ? "pointer-events-none opacity-60" : ""}`}
            >
              <input
                type="radio"
                name="employment-type"
                className="sr-only"
                value={choice.type}
                checked={selected}
                disabled={disabled}
                onChange={() => chooseType(choice.type)}
              />
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${
                    selected ? "border-cyan-600" : "border-slate-400"
                  }`}
                >
                  {selected && (
                    <span className="h-2 w-2 rounded-full bg-cyan-600" />
                  )}
                </span>
                <span className={`text-sm font-semibold ${m.strong}`}>
                  {choice.title}
                </span>
              </span>
              <span className={`mt-1 block pl-6 ${m.muted}`}>
                {choice.hint}
              </span>
            </label>
          );
        })}
      </div>

      {value.type === "external" && (
        <div className="space-y-2">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <label className="block">
              <span className={m.label}>Empresa que lo contrata</span>
              <select
                className={m.input}
                value={value.providerId}
                disabled={disabled}
                onChange={(e) =>
                  onChange({
                    ...value,
                    providerId: e.target.value,
                    companyName:
                      e.target.value === OTHER_COMPANY ? value.companyName : "",
                  })
                }
              >
                <option value="">
                  {isLoading ? "Cargando proveedores…" : "Elige la empresa"}
                </option>
                {options.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.service ? ` · ${p.service}` : ""}
                    {p.isActive ? "" : " (inactiva)"}
                  </option>
                ))}
                <option value={OTHER_COMPANY}>
                  Otra empresa (escribir el nombre)
                </option>
              </select>
            </label>

            {value.providerId === OTHER_COMPANY && (
              <label className="block">
                <span className={m.label}>Nombre de la empresa</span>
                <input
                  className={m.input}
                  value={value.companyName}
                  maxLength={160}
                  disabled={disabled}
                  placeholder="Ej.: Seguridad Andina SAS"
                  onChange={(e) =>
                    onChange({ ...value, companyName: e.target.value })
                  }
                />
              </label>
            )}
          </div>

          <p className={m.muted}>
            {options.length === 0 && !isLoading
              ? "Aún no hay proveedores registrados en el conjunto. "
              : "La lista sale de los proveedores del conjunto. "}
            Si registras la empresa en{" "}
            <Link
              href={route.areaProveedor}
              target="_blank"
              className="font-medium text-cyan-700 hover:underline"
            >
              Proveedores
            </Link>
            , queda con su NIT, contacto y contrato.
          </p>
        </div>
      )}

      {error && (
        <p role="alert" className="text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import { Avatar } from "complexes-next-components";
import { InputField } from "@/app/components/ui/form";
import { fileUrl } from "@/app/helpers/fileUrl";
import { ParcelResident, parcelUnit } from "../../services/parcelService";

interface Props {
  residents: ParcelResident[];
  isLoading: boolean;
  isError: boolean;
  selectedId: string | null;
  onSelect: (resident: ParcelResident) => void;
}

export default function ResidentPicker({
  residents,
  isLoading,
  isError,
  selectedId,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return residents;

    return residents.filter((resident) =>
      `${resident.name ?? ""} ${resident.tower ?? ""} ${resident.apartment}`
        .toLowerCase()
        .includes(term),
    );
  }, [residents, search]);

  const emptyMessage = isLoading
    ? "Cargando residentes..."
    : isError
      ? "No se pudo cargar la lista de residentes."
      : "Ningún residente coincide.";

  return (
    <div className="flex min-w-0 flex-col">
      <InputField
        helpText="Buscar"
        placeholder="Nombre, torre o apartamento"
        value={search}
        inputSize="sm"
        autoFocus
        onChange={(event) => setSearch(event.target.value)}
      />

      <ul className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 md:max-h-[420px]">
        {visible.map((resident) => {
          const selected = selectedId === resident.id;

          return (
            <li key={resident.id}>
              <button
                type="button"
                aria-pressed={selected}
                onClick={() => onSelect(resident)}
                className={`flex w-full items-center gap-3 rounded-xl border p-2.5 text-left transition ${
                  selected
                    ? "border-cyan-700 bg-cyan-700 text-white"
                    : "border-slate-200 bg-white text-slate-900 hover:bg-slate-100"
                }`}
              >
                <Avatar
                  src={fileUrl(resident.file) as string}
                  alt={resident.name ?? "Residente"}
                  size="sm"
                  border="thin"
                  shape="round"
                />
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-semibold">
                    {resident.name ?? "Sin nombre"}
                  </span>
                  <span className="truncate text-xs opacity-70">
                    {parcelUnit(resident)}
                  </span>
                </span>
              </button>
            </li>
          );
        })}

        {visible.length === 0 && (
          <li className="px-2 py-4 text-center text-sm text-slate-500">
            {emptyMessage}
          </li>
        )}
      </ul>
    </div>
  );
}

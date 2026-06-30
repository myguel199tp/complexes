"use client";

import { useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { InputField, Table } from "complexes-next-components";
import { MdFilterAltOff } from "react-icons/md";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useUsersQuery } from "../../my-new-user/_components/use-users-query";
import { useSetBrigadeMember } from "./useEmergency";

export default function BrigadeManager() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const { data, isLoading, error } = useUsersQuery(1, 50);
  const setBrigadeMember = useSetBrigadeMember(conjuntoId);

  const [filterName, setFilterName] = useState("");
  const [filterBrigade, setFilterBrigade] = useState("");

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-40">
        <ImSpinner9 className="animate-spin text-cyan-800" size={40} />
      </div>
    );

  if (error) return null;

  const relations = data?.data ?? [];

  const filtered = relations.filter((r) => {
    const fullName = `${r.user?.name ?? ""} ${r.user?.lastName ?? ""}`.toLowerCase();
    const matchesName = fullName.includes(filterName.toLowerCase());
    const matchesBrigade =
      filterBrigade === "" ||
      (filterBrigade === "si" && !!r.isBrigadeMember) ||
      (filterBrigade === "no" && !r.isBrigadeMember);
    return matchesName && matchesBrigade;
  });

  const cellClasses = filtered.map((r) =>
    Array(3).fill(r.isBrigadeMember ? "bg-cyan-50" : "bg-white"),
  );

  const rows = filtered.map((relation) => [
    <div key={`name-${relation.id}`}>
      {relation.user?.name} {relation.user?.lastName}
    </div>,

    <div key={`tower-${relation.id}`}>
      {relation.tower ?? "-"} / {relation.apartment ?? "-"}
    </div>,

    <input
      key={`brigade-${relation.id}`}
      type="checkbox"
      checked={!!relation.isBrigadeMember}
      disabled={setBrigadeMember.isPending}
      onChange={(e) =>
        setBrigadeMember.mutate({
          relationId: relation.id,
          isBrigadeMember: e.target.checked,
        })
      }
      className="h-4 w-4 accent-cyan-500"
    />,
  ]);

  return (
    <div className="space-y-2 p-2">
      <div>
        <h3 className="text-base font-semibold text-slate-200">Brigadistas</h3>
        <p className="mt-1 text-sm text-slate-400">
          Marca quiénes pueden activar y coordinar emergencias además de
          administración.
        </p>
      </div>

      <div className="bg-white p-2 rounded-xl shadow flex flex-wrap gap-2 items-center">
        <InputField
          placeholder="Buscar por nombre"
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
        />

        <select
          value={filterBrigade}
          onChange={(e) => setFilterBrigade(e.target.value)}
          className="border rounded-md px-3 py-2 text-sm"
        >
          <option value="">Todos</option>
          <option value="si">Brigadistas</option>
          <option value="no">Sin asignar</option>
        </select>

        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1">
            <span className="w-4 h-4 rounded bg-cyan-50 border border-cyan-200 inline-block" />
            <span>Brigadista activo</span>
          </div>
        </div>

        <div
          className="cursor-pointer p-2 rounded hover:bg-gray-100"
          onClick={() => { setFilterName(""); setFilterBrigade(""); }}
          title="Quitar filtros"
        >
          <MdFilterAltOff size={20} />
        </div>
      </div>

      <div>
        <Table
          headers={["Residente", "Torre / Apto", "Brigadista"]}
          rows={rows}
          cellClasses={cellClasses}
          font="bold"
        />
      </div>
    </div>
  );
}

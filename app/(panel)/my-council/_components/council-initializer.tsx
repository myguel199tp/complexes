"use client";
import { useState } from "react";
import { Button } from "complexes-next-components";
import { useInitializeMutation } from "./use-initialize-mutation";
import { useMyUserCouncilQuery } from "./query-user-council";

export default function CouncilInitializer() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const mutation = useInitializeMutation();
  const { data: users, isLoading, isError } = useMyUserCouncilQuery();

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.size === 0) return;
    mutation.mutate(Array.from(selectedIds));
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 text-2xl">
          ⚖️
        </div>
        <h1 className="text-xl font-bold text-gray-900">Inicializar Consejo</h1>
        <p className="text-sm text-gray-500 mt-2">
          Selecciona los residentes que conformarán el consejo de administración.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isLoading && (
          <p className="text-sm text-gray-400 text-center py-6">
            Cargando residentes...
          </p>
        )}

        {isError && (
          <p className="text-sm text-red-500 text-center py-6">
            Error al cargar los residentes. Intenta de nuevo.
          </p>
        )}

        {users && users.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-6">
            No hay residentes disponibles.
          </p>
        )}

        {users && users.length > 0 && (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {users.map((user) => {
              const checked = selectedIds.has(user.id);
              return (
                <label
                  key={user.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    checked
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="w-4 h-4 accent-blue-600 shrink-0"
                    checked={checked}
                    onChange={() => toggle(user.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Apto. {user.apartment}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>
        )}

        {selectedIds.size > 0 && (
          <p className="text-xs text-blue-600 font-medium">
            {selectedIds.size} miembro{selectedIds.size !== 1 ? "s" : ""}{" "}
            seleccionado{selectedIds.size !== 1 ? "s" : ""}
          </p>
        )}

        <Button
          type="submit"
          size="full"
          colVariant="success"
          rounded="md"
          disabled={mutation.isPending || selectedIds.size === 0}
        >
          {mutation.isPending ? "Inicializando..." : "Inicializar Consejo"}
        </Button>
      </form>
    </div>
  );
}

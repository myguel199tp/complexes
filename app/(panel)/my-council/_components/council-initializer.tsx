"use client";
import { useState } from "react";
import { Button, InputField } from "complexes-next-components";
import { useInitializeMutation } from "./use-initialize-mutation";

export default function CouncilInitializer() {
  const [userIds, setUserIds] = useState<string[]>(["", ""]);
  const mutation = useInitializeMutation();

  const add = () => setUserIds((prev) => [...prev, ""]);
  const remove = (i: number) =>
    setUserIds((prev) => prev.filter((_, idx) => idx !== i));
  const update = (i: number, val: string) =>
    setUserIds((prev) => prev.map((v, idx) => (idx === i ? val : v)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ids = userIds.map((id) => id.trim()).filter(Boolean);
    if (ids.length === 0) return;
    mutation.mutate(ids);
  };

  const valid = userIds.some((id) => id.trim().length > 0);

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="text-center mb-8">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4 text-2xl">
          ⚖️
        </div>
        <h1 className="text-xl font-bold text-gray-900">
          Inicializar Consejo
        </h1>
        <p className="text-sm text-gray-500 mt-2">
          Ingresa los IDs de los usuarios que conformarán el consejo de
          administración.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          {userIds.map((id, i) => (
            <div key={i} className="flex gap-2 items-center">
              <div className="flex-1">
                <InputField
                  placeholder={`Miembro ${i + 1} — ID de usuario`}
                  inputSize="sm"
                  value={id}
                  onChange={(e) => update(i, e.target.value)}
                />
              </div>
              {userIds.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(i)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none shrink-0"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={add}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Agregar miembro
        </button>

        <Button
          type="submit"
          size="full"
          colVariant="success"
          rounded="md"
          disabled={mutation.isPending || !valid}
        >
          {mutation.isPending ? "Inicializando..." : "Inicializar Consejo"}
        </Button>
      </form>
    </div>
  );
}

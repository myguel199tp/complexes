"use client";

export default function ExpenseCategoryFormLayout() {
  return (
    <div className="w-full max-w-xl rounded-2xl shadow-md p-6 space-y-6">
      {/* Header */}

      {/* Form */}
      <form className="space-y-5">
        {/* Nombre categoría */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Nombre de la categoría
          </label>

          <input
            type="text"
            placeholder="Ej: Vigilancia"
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Descripción opcional (PRO SaaS) */}
        <div className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Descripción (opcional)
          </label>

          <textarea
            rows={3}
            placeholder="Describe el tipo de gasto..."
            className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100"
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Guardar categoría
          </button>
        </div>
      </form>
    </div>
  );
}

"use client";

import ExpenseCategoryFormLayout from "./form-category";

export default function Form() {
  return (
    <>
      <ExpenseCategoryFormLayout />
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Registrar gasto
          </h2>
          <p className="text-sm text-gray-500">
            Completa la información del gasto del conjunto
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5">
          {/* Concepto */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Concepto
            </label>
            <input
              type="text"
              placeholder="Ej: Pago vigilancia enero"
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Valor */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">Valor</label>
            <input
              type="number"
              placeholder="$ 0"
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Grid fechas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Fecha pago */}
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Fecha de pago
              </label>
              <input
                type="date"
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Periodo */}
            <div className="flex flex-col space-y-1">
              <label className="text-sm font-medium text-gray-700">
                Periodo
              </label>
              <input
                type="month"
                className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Seleccione categoría</option>
              <option>Vigilancia</option>
              <option>Aseo</option>
              <option>Energía</option>
              <option>Mantenimiento</option>
            </select>
          </div>

          {/* Observaciones */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Observaciones
            </label>
            <textarea
              rows={3}
              placeholder="Notas adicionales del gasto..."
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Upload factura */}
          <div className="flex flex-col space-y-1">
            <label className="text-sm font-medium text-gray-700">
              Adjuntar factura
            </label>
            <input
              type="file"
              className="border rounded-lg px-3 py-2 bg-gray-50"
            />
          </div>

          {/* Buttons */}
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
              Guardar gasto
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

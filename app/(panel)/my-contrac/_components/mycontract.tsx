import React from "react";
import { useContractRentQuery } from "./use-contract-query";
import { Text } from "complexes-next-components";

export default function MyContract() {
  const { data, isLoading, error } = useContractRentQuery();

  if (isLoading) {
    return (
      <div className="p-6 rounded-2xl shadow-md bg-white animate-pulse space-y-3">
        <div className="h-6 w-1/3 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600">
        Error al cargar contrato
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 rounded-2xl border border-dashed text-center text-gray-500">
        No hay contrato
      </div>
    );
  }

  return (
    <div className="p-6 rounded-2xl shadow-lg bg-white border border-gray-100 space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <Text as="h2" font="semi" className="text-lg text-gray-800">
            Contrato activo
          </Text>
          <Text size="sm" className="text-gray-500">
            Torre {data.tower} - Apto {data.apartment}
          </Text>
        </div>
      </div>

      {/* INFO PRINCIPAL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-gray-50 rounded-xl">
          <Text size="xs" className="text-gray-500">Canon</Text>
          <Text size="sm" font="semi" className="text-gray-800">
            ${Number(data.rentAmount).toLocaleString()}
          </Text>
        </div>

        <div className="p-4 bg-blue-50 rounded-xl">
          <Text size="xs" className="text-gray-500">Día de pago</Text>
          <Text size="sm" font="semi" colVariant="primary">{data.paymentDay}</Text>
        </div>

        <div className="p-4 bg-purple-50 rounded-xl">
          <Text size="xs" className="text-gray-500">Total pagos</Text>
          <Text size="sm" font="semi" className="text-purple-600">{data.totalPayments}</Text>
        </div>
      </div>

      {/* FECHAS */}
      <div className="flex flex-col md:flex-row md:justify-between text-sm text-gray-600">
        <Text size="sm">📅 Inicio: {new Date(data.startDate).toLocaleDateString()}</Text>
        <Text size="sm">📅 Fin: {new Date(data.endDate).toLocaleDateString()}</Text>
      </div>

      {/* NOTAS */}
      {data.notes && (
        <div className="p-4 bg-yellow-50 rounded-xl text-sm text-gray-700">
          📝 {data.notes}
        </div>
      )}

      {/* ARCHIVO */}
      {data.fileUrl && data.fileUrl !== "undefined" && (
        <div>
          <a
            href={data.fileUrl}
            target="_blank"
            className="text-blue-600 text-sm underline"
          >
            Ver contrato PDF
          </a>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-xs text-gray-400 flex justify-between">
        <span>Creado: {new Date(data.createdAt).toLocaleDateString()}</span>
        <span>
          Actualizado: {new Date(data.updatedAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  InputField,
  Badge,
  Button,
  Modal,
  Text,
} from "complexes-next-components";
import { IoSearchCircle } from "react-icons/io5";
import useFeePaymentsTable from "./useActivitTable";
import { useGenerateFeesMutation } from "./use-generate-fees-mutation";
import { useDeleteConfigMutation } from "./use-delete-config-mutation";
import { useCoefficientsQuery } from "./use-coefficients-query";
import { ConjuntoBankAccount } from "../services/bankUnitService";
import { AdminFeePayment } from "../services/admin-fee-payment";
import { route } from "@/app/_domain/constants/routes";

// 👇 tipado de cuenta bancaria

export default function FeePaymentsTable() {
  const { data, error, filterText, setFilterText, bank } =
    useFeePaymentsTable();

  const router = useRouter();

  const {
    mutate: generateFees,
    isPending: generating,
    variables: generatingId,
  } = useGenerateFeesMutation();

  const { mutate: deleteConfig, isPending: deleting } =
    useDeleteConfigMutation();

  const { data: coefficients } = useCoefficientsQuery();

  const [showBankInfo, setShowBankInfo] = useState(false);
  const [toDelete, setToDelete] = useState<AdminFeePayment | null>(null);

  // Fila con una operación en curso, para no bloquear las demás.
  const busyId = generating
    ? generatingId
    : deleting
      ? toDelete?.id
      : undefined;

  if (error) return <div className="text-red-500">{String(error)}</div>;

  const headers = [
    "Fecha inicio",
    "Monto",
    "Moneda",
    "Tipo",
    "Frecuencia",
    "Pago digital",
    "URL pago",
    "Días aviso",
    "Generación",
    "Creado",
    "Acciones",
  ];

  const filteredRows = data
    .filter((item) => {
      const text = filterText.toLowerCase();

      return (
        String(item.currency).toLowerCase().includes(text) ||
        String(item.recommendedSchedule).toLowerCase().includes(text) ||
        String(item.feeType).toLowerCase().includes(text)
      );
    })
    .map((item) => [
      item.lastPaymentDate
        ? new Date(item.lastPaymentDate).toLocaleDateString()
        : "-",

      item.amount ?? "-",

      item.currency ?? "-",

      item.feeType ?? "-",

      item.recommendedSchedule ?? "-",

      item.digitalPaymentEnabled ? "Sí" : "No",

      item.digitalPaymentUrl ? (
        <a
          href={item.digitalPaymentUrl}
          target="_blank"
          className="text-blue-600 underline"
        >
          Ver link
        </a>
      ) : (
        "-"
      ),

      item.showMessageDaysBefore ?? "-",

      item.feeType === "Cuotas extraordinarias"
        ? item.specificMonths?.join(", ") || "-"
        : `${item.monthsToGenerate ?? "-"} cuotas`,

      item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-",

      /*
        `isPending` es global a la mutación: deshabilitaba todos los botones a la
        vez y no se sabía cuál configuración estaba corriendo. Se compara contra
        la fila para que solo se bloquee la suya.
      */
      <div key={`actions-${item.id}`} className="flex gap-2">
        <button
          onClick={() => generateFees(item.id)}
          disabled={busyId === item.id}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {generating && busyId === item.id ? "Generando..." : "Generar"}
        </button>

        {/*
          Editar y eliminar no existían: la única forma de corregir una
          configuración era volver a guardar el formulario, y eso insertaba una
          fila más en lugar de cambiar la que ya estaba.
        */}
        <button
          onClick={() => router.push(`${route.feees}?id=${item.id}`)}
          className="bg-gray-100 text-gray-700 px-3 py-1 rounded hover:bg-gray-200"
        >
          Editar
        </button>

        <button
          onClick={() => setToDelete(item)}
          disabled={busyId === item.id}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 disabled:opacity-50"
        >
          Eliminar
        </button>
      </div>,
    ]);

  const cellClasses = filteredRows.map(() =>
    headers.map(() => "bg-white text-gray-700"),
  );

  return (
    <div className="w-full p-4">
      {/* 🔎 Buscador */}
      <div className="flex gap-4 mt-4 w-full">
        <InputField
          placeholder="Buscar configuración..."
          helpText="Buscar"
          prefixElement={<IoSearchCircle size={15} />}
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {/*
        Los coeficientes reparten el presupuesto entre las unidades. Si no
        suman 100%, el recaudo no coincide con lo aprobado en asamblea, y antes
        eso solo se descubría sumando a mano al cerrar el mes.
      */}
      {coefficients && !coefficients.isBalanced && (
        <div
          className={`mt-4 rounded-lg border p-3 ${
            coefficients.blocksGeneration
              ? "border-red-200 bg-red-50"
              : "border-yellow-200 bg-yellow-50"
          }`}
        >
          <Text
            size="sm"
            font="semi"
            className={
              coefficients.blocksGeneration
                ? "text-red-700"
                : "text-yellow-800"
            }
          >
            {coefficients.configured
              ? `Los coeficientes de copropiedad suman ${coefficients.percent}% en lugar de 100%.`
              : `Ninguna de las ${coefficients.units} unidades tiene coeficiente configurado.`}
          </Text>

          <Text size="xs" className="mt-1 text-gray-600">
            {coefficients.configured
              ? "Corrígelos antes de generar: con esta suma el recaudo no cubriría el presupuesto."
              : "Cada unidad pagará el monto base completo. Si ese monto es el presupuesto total del conjunto, configura los coeficientes primero."}
          </Text>

          {coefficients.missing.length > 0 && (
            <Text size="xs" className="mt-1 text-gray-600">
              Sin coeficiente:{" "}
              {coefficients.missing
                .slice(0, 8)
                .map((unit) =>
                  [unit.tower, unit.apartment].filter(Boolean).join("-"),
                )
                .join(", ")}
              {coefficients.missing.length > 8
                ? ` y ${coefficients.missing.length - 8} más`
                : ""}
            </Text>
          )}
        </div>
      )}

      {/* 🏦 Cuenta bancaria */}
      <div className="mt-4">
        <button onClick={() => setShowBankInfo((prev) => !prev)}>
          <Badge size="sm" colVariant="primary" rounded="lg">
            Cuenta de banco {showBankInfo ? "▲" : "▼"}
          </Badge>
        </button>

        {showBankInfo && (
          <div className="absolute z-50 mt-2 p-4 border rounded-lg bg-white shadow-lg w-full md:w-[400px]">
            {" "}
            {bank && bank.length > 0 ? (
              (bank as ConjuntoBankAccount[]).map((b) => (
                <div key={b.id} className="mb-4 text-sm text-gray-700">
                  <p>
                    <strong>Banco:</strong> {b.bankName}
                  </p>
                  <p>
                    <strong>Número:</strong> {b.accountNumber}
                  </p>
                  <p>
                    <strong>Tipo:</strong> {b.accountType}
                  </p>
                  <p>
                    <strong>Estado:</strong> {b.isActive}
                  </p>

                  <div className="flex gap-2 mt-2">
                    {b.isPrimary && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        Principal
                      </span>
                    )}
                  </div>

                  <hr className="mt-3" />
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">
                No hay cuentas registradas
              </p>
            )}
          </div>
        )}
      </div>

      {/* 📊 Tabla */}
      <Table
        headers={headers}
        rows={filteredRows}
        cellClasses={cellClasses}
        /* Había 12 anchos para 11 columnas. */
        columnWidths={[
          "9%",
          "9%",
          "7%",
          "14%",
          "9%",
          "9%",
          "7%",
          "7%",
          "8%",
          "9%",
          "12%",
        ]}
      />

      <Modal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        title="Eliminar configuración"
      >
        <div className="flex flex-col gap-3 py-2">
          <Text size="sm">
            Se eliminará la configuración de{" "}
            <strong>{toDelete?.feeType ?? "esta cuota"}</strong>.
          </Text>

          {/*
            Conviene decirlo explícitamente: el backend suelta la referencia de
            las cuotas ya generadas en vez de borrarlas, porque son deuda real
            del residente.
          */}
          <Text size="xs" className="text-gray-500">
            Las cuotas que ya se generaron con ella no se borran: siguen siendo
            deuda de cada unidad. Solo se pierde el vínculo con esta
            configuración.
          </Text>

          <div className="flex justify-end gap-2">
            <Button
              colVariant="default"
              rounded="md"
              onClick={() => setToDelete(null)}
              disabled={deleting}
            >
              Cancelar
            </Button>

            <Button
              colVariant="danger"
              rounded="md"
              disabled={deleting}
              onClick={() =>
                toDelete &&
                deleteConfig(toDelete.id, {
                  onSuccess: () => setToDelete(null),
                })
              }
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

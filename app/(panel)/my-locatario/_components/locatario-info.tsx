"use client";

import React, { useState } from "react";
import { useTenantQuery } from "./locatario-query";
import ContractForm from "./contract/form";
import { Button, Text, Title } from "complexes-next-components";
import { useContractQuery } from "./contract-query";
import { useContractSummarytQuery } from "./contract-summary-query";
import { useContractPymentQuery } from "./contract-pyment-query";
import { ContractPaymentResponse } from "../services/response/contractPaymentResponse";

export default function LocatarioInfos() {
  const { data, isLoading, error } = useTenantQuery();

  const { data: contract, isLoading: contractLoading } = useContractQuery();

  const { data: summary } = useContractSummarytQuery();
  const { data: payments } = useContractPymentQuery();

  const [showForm, setShowForm] = useState(false);

  if (isLoading || contractLoading) {
    return (
      <div className="p-4 rounded-2xl shadow-md bg-white animate-pulse space-y-3">
        <div className="h-6 w-1/2 bg-gray-200 rounded"></div>
        <div className="h-4 w-1/3 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-600">
        Error al cargar el arrendador
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
        No tienes arrendador registrado
      </div>
    );
  }

  const relation = data.conjuntoRelations?.[0];

  return (
    <div className="p-6 mt-6 rounded-2xl shadow-lg bg-white border border-gray-100 space-y-6">
      {/* =========================
         🔝 HEADER (tenant + contrato)
      ========================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🧍 IZQUIERDA */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg">
              {data.name?.[0]}
              {data.lastName?.[0]}
            </div>

            <div>
              <Text as="h2" font="semi" className="text-lg text-gray-800">
                {data.name} {data.lastName}
              </Text>
              <Text size="sm" className="text-gray-500">Arrendador</Text>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <Text size="sm">📧 {data.email}</Text>
            <Text size="sm">
              📱 {data.indicative} {data.phone}
            </Text>

            {relation && (
              <Text size="sm">
                🏠 Torre {relation.tower} - Apto {relation.apartment}
              </Text>
            )}
          </div>
        </div>

        {/* 📄 CONTRATO */}
        <div className="border-l pl-6 flex flex-col justify-center">
          {!contract ? (
            <div className="text-center space-y-3">
              <Text size="sm" className="text-gray-500">
                No hay contrato registrado
              </Text>

              <Button onClick={() => setShowForm(true)} colVariant="success">
                + Agregar contrato
              </Button>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-gray-700">
              <Text size="sm">💰 ${Number(contract.rentAmount).toLocaleString()}</Text>
              <Text size="sm">📅 Día de pago: {contract.paymentDay}</Text>
              <Text size="sm">
                📆 {new Date(contract.startDate).toLocaleDateString()} -{" "}
                {new Date(contract.endDate).toLocaleDateString()}
              </Text>

              {contract.fileUrl && (
                <a
                  href={contract.fileUrl}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Ver contrato PDF
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* =========================
         📊 SUMMARY (SOLO SI HAY CONTRATO)
      ========================= */}
      {contract && summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-xl text-center">
            <Text size="xs" className="text-gray-500">Total</Text>
            <Text size="sm" font="semi">
              ${summary.totalExpected.toLocaleString()}
            </Text>
          </div>

          <div className="p-4 bg-green-50 rounded-xl text-center">
            <Text size="xs" className="text-gray-500">Pagado</Text>
            <Text size="sm" font="semi" colVariant="success">
              ${summary.totalPaid.toLocaleString()}
            </Text>
          </div>

          <div className="p-4 bg-red-50 rounded-xl text-center">
            <Text size="xs" className="text-gray-500">Pendiente</Text>
            <Text size="sm" font="semi" colVariant="danger">
              ${summary.totalPending.toLocaleString()}
            </Text>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <Text size="xs" className="text-gray-500">Pagos</Text>
            <Text size="sm" font="semi">
              {summary.paymentsPaid}/
              {summary.paymentsPaid + summary.paymentsPending}
            </Text>
          </div>
        </div>
      )}

      {contract && (
        <div>
          <Title as="h3" size="xs" font="semi" className="mb-3">Pagos</Title>

          {!payments ? (
            <Text size="sm" className="text-gray-500">Cargando pagos...</Text>
          ) : !Array.isArray(payments) ? (
            <Text size="sm" colVariant="danger">Error en pagos</Text>
          ) : payments.length === 0 ? (
            <Text size="sm" className="text-gray-500">No hay pagos</Text>
          ) : (
            <div className="space-y-2">
              {payments.map((p: ContractPaymentResponse) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <Text size="sm" className="font-medium">
                      {p.month}/{p.year}
                    </Text>
                    <Text size="xs" className="text-gray-500">
                      ${p.amount.toLocaleString()}
                    </Text>
                  </div>

                  <div>
                    {p.status === "PAID" ? (
                      <span className="text-green-600 text-sm">Pagado</span>
                    ) : p.status === "OVERDUE" ? (
                      <span className="text-red-600 text-sm">Vencido</span>
                    ) : (
                      <span className="text-yellow-600 text-sm">Pendiente</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORM */}
      {!contract && showForm && relation && (
        <ContractForm
          tenantID={data.id}
          torre={relation.tower}
          apartment={relation.apartment}
        />
      )}
    </div>
  );
}

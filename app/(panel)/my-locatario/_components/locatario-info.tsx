"use client";

import React, { useState } from "react";
import { useTenantQuery } from "./locatario-query";
import ContractForm from "./contract/form";
import { Button } from "complexes-next-components";
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
              <h2 className="text-lg font-semibold text-gray-800">
                {data.name} {data.lastName}
              </h2>
              <p className="text-sm text-gray-500">Arrendador</p>
            </div>
          </div>

          <div className="space-y-2 text-sm text-gray-700">
            <p>📧 {data.email}</p>
            <p>
              📱 {data.indicative} {data.phone}
            </p>

            {relation && (
              <p>
                🏠 Torre {relation.tower} - Apto {relation.apartment}
              </p>
            )}
          </div>
        </div>

        {/* 📄 CONTRATO */}
        <div className="border-l pl-6 flex flex-col justify-center">
          {!contract ? (
            <div className="text-center space-y-3">
              <p className="text-gray-500 text-sm">
                No hay contrato registrado
              </p>

              <Button onClick={() => setShowForm(true)} colVariant="success">
                + Agregar contrato
              </Button>
            </div>
          ) : (
            <div className="space-y-3 text-sm text-gray-700">
              <p>💰 ${Number(contract.rentAmount).toLocaleString()}</p>
              <p>📅 Día de pago: {contract.paymentDay}</p>
              <p>
                📆 {new Date(contract.startDate).toLocaleDateString()} -{" "}
                {new Date(contract.endDate).toLocaleDateString()}
              </p>

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
            <p className="text-xs text-gray-500">Total</p>
            <p className="font-semibold">
              ${summary.totalExpected.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-green-50 rounded-xl text-center">
            <p className="text-xs text-gray-500">Pagado</p>
            <p className="font-semibold text-green-600">
              ${summary.totalPaid.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-red-50 rounded-xl text-center">
            <p className="text-xs text-gray-500">Pendiente</p>
            <p className="font-semibold text-red-600">
              ${summary.totalPending.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl text-center">
            <p className="text-xs text-gray-500">Pagos</p>
            <p className="font-semibold">
              {summary.paymentsPaid}/
              {summary.paymentsPaid + summary.paymentsPending}
            </p>
          </div>
        </div>
      )}

      {contract && (
        <div>
          <h3 className="font-semibold mb-3">Pagos</h3>

          {!payments ? (
            <p className="text-sm text-gray-500">Cargando pagos...</p>
          ) : !Array.isArray(payments) ? (
            <p className="text-sm text-red-500">Error en pagos</p>
          ) : payments.length === 0 ? (
            <p className="text-sm text-gray-500">No hay pagos</p>
          ) : (
            <div className="space-y-2">
              {payments.map((p: ContractPaymentResponse) => (
                <div
                  key={p.id}
                  className="flex justify-between items-center p-3 border rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {p.month}/{p.year}
                    </p>
                    <p className="text-xs text-gray-500">
                      ${p.amount.toLocaleString()}
                    </p>
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

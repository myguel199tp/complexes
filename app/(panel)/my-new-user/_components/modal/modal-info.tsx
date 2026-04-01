"use client";

import React, { useState } from "react";
import { Modal, Tabs, Text } from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useMutationRejectPayment } from "./rejectMutation";
import { useMutationApprovePayment } from "./aprovedMutation";
import { useQueryClient } from "@tanstack/react-query"; // 🔥

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: EnsembleResponse | null;
  title?: string;
}

export default function ModalInfo({
  isOpen,
  onClose,
  selectedUser,
  title = "Información del propietario",
}: Props) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [dateFilter, setDateFilter] = useState("");
  const approveMutation = useMutationApprovePayment();
  const rejectMutation = useMutationRejectPayment();
  const queryClient = useQueryClient();

  const filteredPayments = selectedUser?.adminFees?.filter((p) =>
    dateFilter ? p.dueDate.startsWith(dateFilter) : true,
  );

  if (!selectedUser) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="py-4">
          {t("noSeleccionado") || "No hay propietario seleccionado"}
        </div>
      </Modal>
    );
  }

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const handleApprove = (id: string) => {
    approveMutation.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries(["adminFees"]);
        onClose();
      },
    });
  };

  const handleReject = (id: string) => {
    const reason = prompt("Archivo invalido");
    if (!reason) return;

    rejectMutation.mutate(
      { id, reason },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["adminFees"]);
        },
      },
    );
  };

  if (!selectedUser) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title={title}>
        <div className="py-4">
          {t("noSeleccionado") || "No hay propietario seleccionado"}
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="w-[1200px]"
    >
      <Tabs
        defaultActiveIndex={0}
        tabs={[
          {
            tKey: "Información del usuario",
            children: (
              <div
                key={language}
                className="p-5 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <div>
                  <Text size="xs" className="text-gray-500">
                    Nombre
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.user?.name || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Apellido
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.user?.lastName || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Número de identificación
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.user?.numberId || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Indicativo
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.user?.indicative || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Celular
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.user?.phone || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Correo
                  </Text>
                  <Text size="sm" className="font-medium break-all">
                    {selectedUser.user?.email || "-"}
                  </Text>
                </div>
              </div>
            ),
          },
          {
            tKey: "Conjunto residencial",
            children: (
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Text size="xs" className="text-gray-500">
                    Nombre
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.conjunto?.name || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Dirección
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.conjunto?.address || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Ciudad
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.conjunto?.city || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    País
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.conjunto?.country || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Barrio
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.conjunto?.neighborhood || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Teléfono
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.user?.phone || "-"}
                  </Text>
                </div>

                <div className="sm:col-span-2">
                  <Text size="xs" className="text-gray-500">
                    Plan
                  </Text>
                  <Text size="sm" className="font-medium capitalize">
                    {selectedUser.conjunto?.plan || "-"}
                  </Text>
                </div>
              </div>
            ),
          },
          {
            tKey: "Inmueble",
            children: (
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Text size="xs" className="text-gray-500">
                    Torre
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.tower || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Apartamento
                  </Text>
                  <Text size="sm" className="font-medium">
                    {selectedUser.apartment || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Rol
                  </Text>
                  <Text size="sm" className="font-medium capitalize">
                    {selectedUser.role || "-"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Residencia principal
                  </Text>
                  <Text
                    size="sm"
                    className={`font-medium ${
                      selectedUser.isMainResidence
                        ? "text-green-600"
                        : "text-gray-600"
                    }`}
                  >
                    {selectedUser.isMainResidence ? "Sí" : "No"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" className="text-gray-500">
                    Activo
                  </Text>
                  <Text
                    size="sm"
                    className={`font-medium ${
                      selectedUser.active ? "text-green-600" : "text-red-500"
                    }`}
                  >
                    {selectedUser.active ? "Sí" : "No"}
                  </Text>
                </div>
              </div>
            ),
          },
          {
            tKey: "Vehículos",
            children: (
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 space-y-4">
                {selectedUser.vehicles?.length ? (
                  selectedUser.vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="p-4 bg-white rounded-md border grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <div>
                        <Text size="xs" className="text-gray-500">
                          Tipo
                        </Text>
                        <Text size="sm" className="font-medium capitalize">
                          {v.type}
                        </Text>
                      </div>

                      <div>
                        <Text size="xs" className="text-gray-500">
                          Parqueadero
                        </Text>
                        <Text size="sm" className="font-medium">
                          {v.parkingType}
                        </Text>
                      </div>

                      <div>
                        <Text size="xs" className="text-gray-500">
                          Número asignado
                        </Text>
                        <Text size="sm" className="font-medium">
                          {v.assignmentNumber}
                        </Text>
                      </div>

                      <div>
                        <Text size="xs" className="text-gray-500">
                          Placa
                        </Text>
                        <Text size="sm" className="font-medium uppercase">
                          {v.plaque}
                        </Text>
                      </div>
                    </div>
                  ))
                ) : (
                  <Text size="sm" className="text-gray-500">
                    No tiene vehículos registrados.
                  </Text>
                )}
              </div>
            ),
          },
          {
            tKey: "Pagos",
            children: (
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                <div className="mb-4">
                  <Text size="xs" className="text-gray-500 mb-1">
                    Buscar por fecha
                  </Text>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm border rounded-md"
                  />
                </div>

                <div className="max-h-[380px] overflow-y-auto space-y-4">
                  {filteredPayments?.length ? (
                    filteredPayments.map((p) => {
                      const pdfUrl = p.file
                        ? `${BASE_URL}/uploads/pdfs/${p.file.replace(/^.*[\\/]/, "")}`
                        : null;

                      return (
                        <div
                          key={p.id}
                          className="p-4 bg-white rounded-md border grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                          <div>
                            <Text size="xs">Monto</Text>
                            <Text size="sm">${p.amount}</Text>
                          </div>

                          <div>
                            <Text size="xs">Fecha</Text>
                            <Text size="sm">{p.dueDate}</Text>
                          </div>

                          <div>
                            <Text size="xs">Estado</Text>
                            <Text
                              size="sm"
                              className={`font-bold ${
                                p.status === "APPROVED"
                                  ? "text-green-600"
                                  : p.status === "REJECTED"
                                    ? "text-red-500"
                                    : "text-yellow-500"
                              }`}
                            >
                              {p.status}
                            </Text>
                          </div>

                          {pdfUrl && (
                            <div className="sm:col-span-2">
                              <a
                                href={pdfUrl}
                                target="_blank"
                                className="text-blue-600 underline text-sm"
                              >
                                Ver comprobante PDF
                              </a>
                            </div>
                          )}

                          {p.status === "PENDING" && (
                            <div className="sm:col-span-2 flex gap-2">
                              <button
                                onClick={() => handleApprove(p.id)}
                                className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                              >
                                Aprobar
                              </button>

                              <button
                                onClick={() => handleReject(p.id)}
                                className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                              >
                                Rechazar
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <Text size="sm" className="text-gray-500">
                      No hay pagos
                    </Text>
                  )}
                </div>
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}

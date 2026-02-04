"use client";

import React, { useState } from "react";
import { Modal, Tabs, Text } from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useLanguage } from "@/app/hooks/useLanguage";

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
            size: "sm",
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
            size: "sm",
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
            size: "sm",
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
            size: "sm",
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
            size: "sm",
            children: (
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-200">
                {/* Buscador */}
                <div className="mb-4">
                  <Text size="xs" className="text-gray-500 mb-1">
                    Buscar por fecha
                  </Text>
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="
            w-full px-3 py-2 text-sm
            border rounded-md
            focus:outline-none focus:ring-2 focus:ring-primary-500
          "
                  />
                </div>

                {/* Lista con scroll */}
                <div className="max-h-[380px] overflow-y-auto space-y-4">
                  {filteredPayments?.length ? (
                    filteredPayments.map((p) => (
                      <div
                        key={p.dueDate}
                        className="p-4 bg-white rounded-md border grid grid-cols-1 sm:grid-cols-2 gap-4"
                      >
                        <div>
                          <Text size="xs" className="text-gray-500">
                            Monto
                          </Text>
                          <Text size="sm" className="font-medium">
                            ${p.amount}
                          </Text>
                        </div>

                        <div>
                          <Text size="xs" className="text-gray-500">
                            Fecha
                          </Text>
                          <Text size="sm" className="font-medium">
                            {p.dueDate}
                          </Text>
                        </div>

                        <div>
                          <Text size="xs" className="text-gray-500">
                            Tipo de pago
                          </Text>
                          <Text size="sm" className="font-medium capitalize">
                            {p.type}
                          </Text>
                        </div>

                        <div className="sm:col-span-2">
                          <Text size="xs" className="text-gray-500">
                            Descripción
                          </Text>
                          <Text size="sm" className="font-medium text-gray-700">
                            {p.description || "-"}
                          </Text>
                        </div>
                      </div>
                    ))
                  ) : (
                    <Text size="sm" className="text-gray-500">
                      No hay pagos para la fecha seleccionada.
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

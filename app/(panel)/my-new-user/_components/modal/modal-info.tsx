"use client";

import React from "react";
import { Modal, Tabs, Text } from "complexes-next-components";
import { useTranslation } from "react-i18next";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";

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
              <div className="p-4">
                <Text size="md">
                  <Text as="span" font="semi">
                    Nombre:
                  </Text>{" "}
                  {selectedUser.user?.name}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Apellido:
                  </Text>{" "}
                  {selectedUser.user?.lastName}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Número de identificación:
                  </Text>{" "}
                  {selectedUser.user?.numberId}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Indicativo:
                  </Text>{" "}
                  {selectedUser.user?.indicative}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Teléfono:
                  </Text>{" "}
                  {selectedUser.user?.phone}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Correo:
                  </Text>{" "}
                  {selectedUser.user?.email}
                </Text>
              </div>
            ),
          },
          {
            tKey: "Conjunto residencial",
            children: (
              <div className="p-4">
                <Text size="md">
                  <Text as="span" font="semi">
                    Nombre:
                  </Text>{" "}
                  {selectedUser.conjunto?.name}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Dirección:
                  </Text>{" "}
                  {selectedUser.conjunto?.address}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Ciudad:
                  </Text>{" "}
                  {selectedUser.conjunto?.city}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    País:
                  </Text>{" "}
                  {selectedUser.conjunto?.country}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Barrio:
                  </Text>{" "}
                  {selectedUser.conjunto?.neighborhood}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Teléfono:
                  </Text>{" "}
                  {selectedUser.user.phone}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Plan:
                  </Text>{" "}
                  {selectedUser.conjunto?.plan}
                </Text>
              </div>
            ),
          },
          {
            tKey: "Inmueble",
            children: (
              <div className="p-4">
                <Text size="md">
                  <Text as="span" font="semi">
                    Torre:
                  </Text>{" "}
                  {selectedUser.tower}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Apartamento:
                  </Text>{" "}
                  {selectedUser.apartment}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Rol:
                  </Text>{" "}
                  {selectedUser.role}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Residencia principal:
                  </Text>{" "}
                  {selectedUser.isMainResidence ? "Sí" : "No"}
                </Text>
                <Text size="md">
                  <Text as="span" font="semi">
                    Activo:
                  </Text>{" "}
                  {selectedUser.active ? "Sí" : "No"}
                </Text>
              </div>
            ),
          },
          {
            tKey: "Vehiculos",
            children: (
              <div className="p-4">
                {selectedUser.vehicles?.length ? (
                  selectedUser.vehicles.map((v) => (
                    <div
                      key={v.id}
                      className="pl-2 mb-3 border-l border-gray-300"
                    >
                      <Text size="md">
                        <Text as="span" font="semi">
                          Tipo:
                        </Text>{" "}
                        {v.type}
                      </Text>
                      <Text size="md">
                        <Text as="span" font="semi">
                          Parqueadero:
                        </Text>{" "}
                        {v.parkingType}
                      </Text>
                      <Text size="md">
                        <Text as="span" font="semi">
                          Número asignado:
                        </Text>{" "}
                        {v.assignmentNumber}
                      </Text>
                      <Text size="md">
                        <Text as="span" font="semi">
                          Placa:
                        </Text>{" "}
                        {v.plaque}
                      </Text>
                    </div>
                  ))
                ) : (
                  <Text size="md">No tiene vehículos registrados.</Text>
                )}
              </div>
            ),
          },
          {
            tKey: "Pagos",
            children: (
              <div className="p-4">
                {selectedUser.adminFees?.length ? (
                  selectedUser.adminFees.map((p) => (
                    <div
                      key={p.dueDate}
                      className="pl-2 mb-3 border-l border-gray-300"
                    >
                      <Text size="md">
                        <Text as="span" font="semi">
                          Monto:
                        </Text>{" "}
                        {p.amount}
                      </Text>
                      <Text size="md">
                        <Text as="span" font="semi">
                          Fecha:
                        </Text>{" "}
                        {p.dueDate}
                      </Text>
                      <Text size="md">
                        <Text as="span" font="semi">
                          Tipo de pago:
                        </Text>{" "}
                        {p.type}
                      </Text>
                      <Text size="md">
                        <Text as="span" font="semi">
                          Descripción:
                        </Text>{" "}
                        {p.description}
                      </Text>
                    </div>
                  ))
                ) : (
                  <Text size="md">No tiene pagos registrados.</Text>
                )}
              </div>
            ),
          },
        ]}
      />
    </Modal>
  );
}

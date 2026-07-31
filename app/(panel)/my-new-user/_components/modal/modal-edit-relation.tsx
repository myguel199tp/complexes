"use client";

import React, { useEffect, useState } from "react";
import {
  Button,
  Buton,
  InputField,
  Modal,
  SelectField,
  Text,
} from "complexes-next-components";
import { MdDeleteForever } from "react-icons/md";
import { EnsembleResponse } from "@/app/(sets)/ensemble/service/response/ensembleResponse";
import { useEditRelationMutations } from "./use-edit-relation-mutations";
import type { VehiclePayload } from "../../services/relationEditService";

export type EditSection = "user" | "vehicles";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedUser: EnsembleResponse | null;
  section: EditSection;
}

const VEHICLE_TYPE_OPTIONS = [
  { value: "carro", label: "Carro" },
  { value: "moto", label: "Moto" },
];

const PARKING_TYPE_OPTIONS = [
  { value: "publico", label: "Público" },
  { value: "privado", label: "Privado" },
];

const EMPTY_VEHICLE: VehiclePayload = {
  type: "carro",
  parkingType: "privado",
  assignmentNumber: "",
  plaque: "",
};

export default function ModalEditRelation({
  isOpen,
  onClose,
  selectedUser,
  section,
}: Props) {
  const { updateUserInfo, addVehicle, updateVehicle, removeVehicle } =
    useEditRelationMutations(selectedUser?.id);

  const [form, setForm] = useState({
    name: "",
    lastName: "",
    numberId: "",
    indicative: "",
    phone: "",
    council: false,
  });

  const [newVehicle, setNewVehicle] = useState<VehiclePayload>(EMPTY_VEHICLE);
  const [vehicleDrafts, setVehicleDrafts] = useState<
    Record<string, VehiclePayload>
  >({});

  // Al abrir se rehidrata desde el usuario seleccionado: si se dejara el
  // estado anterior, se podrían guardar los datos de otro residente.
  useEffect(() => {
    if (!isOpen || !selectedUser) return;

    setForm({
      name: selectedUser.user?.name ?? "",
      lastName: selectedUser.user?.lastName ?? "",
      numberId: selectedUser.user?.numberId ?? "",
      indicative: selectedUser.user?.indicative ?? "",
      phone: selectedUser.user?.phone ?? "",
      council: !!selectedUser.user?.council,
    });

    setNewVehicle(EMPTY_VEHICLE);

    setVehicleDrafts(
      Object.fromEntries(
        (selectedUser.vehicles ?? []).map((v) => [
          v.id,
          {
            type: v.type ?? "carro",
            parkingType: v.parkingType ?? "privado",
            assignmentNumber: v.assignmentNumber ?? "",
            plaque: v.plaque ?? "",
          },
        ]),
      ),
    );
  }, [isOpen, selectedUser]);

  if (!selectedUser) return null;

  const setField = (
    field: "name" | "lastName" | "numberId" | "indicative" | "phone",
    value: string,
  ) => setForm((prev) => ({ ...prev, [field]: value }));

  const setDraft = (
    vehicleId: string,
    field: keyof VehiclePayload,
    value: string,
  ) =>
    setVehicleDrafts((prev) => ({
      ...prev,
      [vehicleId]: { ...prev[vehicleId], [field]: value },
    }));

  const handleSaveUserInfo = () => {
    updateUserInfo.mutate(
      {
        name: form.name.trim(),
        lastName: form.lastName.trim(),
        numberId: form.numberId.trim(),
        indicative: form.indicative.trim(),
        phone: form.phone.trim(),
        council: form.council,
      },
      { onSuccess: onClose },
    );
  };

  const handleAddVehicle = () => {
    if (!newVehicle.plaque.trim()) return;

    addVehicle.mutate(
      { ...newVehicle, plaque: newVehicle.plaque.trim().toUpperCase() },
      { onSuccess: () => setNewVehicle(EMPTY_VEHICLE) },
    );
  };

  const handleDeleteVehicle = (vehicleId: string, plaque: string) => {
    if (
      !window.confirm(
        `Se eliminará el vehículo con placa ${plaque}. Esta acción no se puede deshacer. ¿Continuar?`,
      )
    ) {
      return;
    }

    removeVehicle.mutate(vehicleId);
  };

  const title =
    section === "user"
      ? "Editar información del usuario"
      : "Editar vehículos";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      // Se abre encima de la modal de resumen, que usa el z-50 por defecto.
      zIndex="z-[60]"
      className="w-11/12 max-w-3xl max-h-[85vh] overflow-y-auto"
    >
      <div className="space-y-4">
        <Text size="sm" className="text-gray-500">
          Los cambios quedan registrados y el residente los verá en su perfil.
        </Text>

        {section === "user" ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Text size="xs" className="text-gray-500 mb-1">
                  Nombre
                </Text>
                <InputField
                  inputSize="sm"
                  value={form.name}
                  onChange={(e) => setField("name", e.target.value)}
                />
              </div>

              <div>
                <Text size="xs" className="text-gray-500 mb-1">
                  Apellido
                </Text>
                <InputField
                  inputSize="sm"
                  value={form.lastName}
                  onChange={(e) => setField("lastName", e.target.value)}
                />
              </div>

              <div>
                <Text size="xs" className="text-gray-500 mb-1">
                  Número de identificación
                </Text>
                <InputField
                  inputSize="sm"
                  value={form.numberId}
                  onChange={(e) => setField("numberId", e.target.value)}
                />
              </div>

              <div>
                <Text size="xs" className="text-gray-500 mb-1">
                  Indicativo
                </Text>
                <InputField
                  inputSize="sm"
                  value={form.indicative}
                  onChange={(e) => setField("indicative", e.target.value)}
                />
              </div>

              <div>
                <Text size="xs" className="text-gray-500 mb-1">
                  Celular
                </Text>
                <InputField
                  inputSize="sm"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                />
              </div>

              <div>
                <Text size="xs" className="text-gray-500 mb-1">
                  Consejo
                </Text>

                <div className="flex items-center gap-3 py-1">
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={form.council}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          council: e.target.checked,
                        }))
                      }
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-800 rounded-full peer-checked:bg-cyan-800 transition-colors"></div>
                    <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border border-gray-300 transition-transform peer-checked:translate-x-full"></div>
                  </label>

                  <Text size="sm" className="text-gray-700">
                    {form.council
                      ? "Pertenece al consejo"
                      : "No pertenece al consejo"}
                  </Text>
                </div>
              </div>
            </div>

            <div className="rounded-md bg-gray-50 border p-3">
              <Text size="xs" className="text-gray-500">
                El correo ({selectedUser.user?.email || "-"}) no se puede
                cambiar desde aquí: es la credencial de acceso del residente.
              </Text>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <Buton colVariant="none" borderWidth="none" onClick={onClose}>
                Cancelar
              </Buton>

              <Button
                colVariant="primary"
                onClick={handleSaveUserInfo}
                disabled={updateUserInfo.isPending}
              >
                {updateUserInfo.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-3">
              {selectedUser.vehicles?.length ? (
                selectedUser.vehicles.map((vehicle) => {
                  const draft = vehicleDrafts[vehicle.id] ?? EMPTY_VEHICLE;

                  return (
                    <div
                      key={vehicle.id}
                      className="rounded-md border bg-white p-3 space-y-3"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <Text size="xs" className="text-gray-500 mb-1">
                            Tipo
                          </Text>
                          <SelectField
                            inputSize="sm"
                            options={VEHICLE_TYPE_OPTIONS}
                            value={draft.type}
                            onChange={(e) =>
                              setDraft(vehicle.id, "type", e.target.value)
                            }
                          />
                        </div>

                        <div>
                          <Text size="xs" className="text-gray-500 mb-1">
                            Parqueadero
                          </Text>
                          <SelectField
                            inputSize="sm"
                            options={PARKING_TYPE_OPTIONS}
                            value={draft.parkingType}
                            onChange={(e) =>
                              setDraft(
                                vehicle.id,
                                "parkingType",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div>
                          <Text size="xs" className="text-gray-500 mb-1">
                            Número asignado
                          </Text>
                          <InputField
                            inputSize="sm"
                            value={draft.assignmentNumber ?? ""}
                            onChange={(e) =>
                              setDraft(
                                vehicle.id,
                                "assignmentNumber",
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div>
                          <Text size="xs" className="text-gray-500 mb-1">
                            Placa
                          </Text>
                          <InputField
                            inputSize="sm"
                            value={draft.plaque}
                            onChange={(e) =>
                              setDraft(vehicle.id, "plaque", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2">
                        <Buton
                          colVariant="danger"
                          borderWidth="none"
                          onClick={() =>
                            handleDeleteVehicle(vehicle.id, vehicle.plaque)
                          }
                        >
                          <span className="flex items-center gap-1">
                            <MdDeleteForever /> Eliminar
                          </span>
                        </Buton>

                        <Button
                          colVariant="primary"
                          disabled={updateVehicle.isPending}
                          onClick={() =>
                            updateVehicle.mutate({
                              vehicleId: vehicle.id,
                              dto: {
                                ...draft,
                                plaque: draft.plaque.trim().toUpperCase(),
                              },
                            })
                          }
                        >
                          Guardar
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <Text size="sm" className="text-gray-500">
                  No tiene vehículos registrados.
                </Text>
              )}
            </div>

            <div className="rounded-md border border-dashed bg-gray-50 p-3 space-y-3">
              <Text size="sm" font="semi">
                Agregar vehículo
              </Text>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <SelectField
                  inputSize="sm"
                  options={VEHICLE_TYPE_OPTIONS}
                  value={newVehicle.type}
                  onChange={(e) =>
                    setNewVehicle((v) => ({ ...v, type: e.target.value }))
                  }
                />

                <SelectField
                  inputSize="sm"
                  options={PARKING_TYPE_OPTIONS}
                  value={newVehicle.parkingType}
                  onChange={(e) =>
                    setNewVehicle((v) => ({
                      ...v,
                      parkingType: e.target.value,
                    }))
                  }
                />

                <InputField
                  inputSize="sm"
                  placeholder="Número asignado"
                  value={newVehicle.assignmentNumber ?? ""}
                  onChange={(e) =>
                    setNewVehicle((v) => ({
                      ...v,
                      assignmentNumber: e.target.value,
                    }))
                  }
                />

                <InputField
                  inputSize="sm"
                  placeholder="Placa"
                  value={newVehicle.plaque}
                  onChange={(e) =>
                    setNewVehicle((v) => ({ ...v, plaque: e.target.value }))
                  }
                />
              </div>

              <div className="flex justify-end">
                <Button
                  colVariant="success"
                  disabled={addVehicle.isPending || !newVehicle.plaque.trim()}
                  onClick={handleAddVehicle}
                >
                  {addVehicle.isPending ? "Agregando..." : "Agregar"}
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <Buton colVariant="none" borderWidth="none" onClick={onClose}>
                Cerrar
              </Buton>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

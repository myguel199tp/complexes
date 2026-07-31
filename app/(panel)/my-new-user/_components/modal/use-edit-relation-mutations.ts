"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  addRelationVehicleService,
  removeRelationVehicleService,
  updateRelationUserInfoService,
  updateRelationVehicleService,
  type UpdateRelationUserInfoDto,
  type VehiclePayload,
} from "../../services/relationEditService";

/**
 * Mutaciones de edición del resumen del usuario. Todas invalidan
 * `query_user_register`, la key del listado de /my-new-user, para que la tabla
 * y la modal muestren el dato nuevo sin recargar la página.
 */
export function useEditRelationMutations(relationId: string | undefined) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((state) => state.showAlert);
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["query_user_register"] });
  };

  const onError = (error: unknown) => {
    showAlert(
      error instanceof Error ? error.message : "No se pudo guardar el cambio",
      "error",
    );
  };

  const updateUserInfo = useMutation({
    mutationFn: (dto: UpdateRelationUserInfoDto) =>
      updateRelationUserInfoService(String(relationId), conjuntoId, dto),
    onSuccess: () => {
      showAlert("¡Datos actualizados exitosamente!", "success");
      invalidate();
    },
    onError,
  });

  const addVehicle = useMutation({
    mutationFn: (dto: VehiclePayload) =>
      addRelationVehicleService(String(relationId), conjuntoId, dto),
    onSuccess: () => {
      showAlert("¡Vehículo agregado exitosamente!", "success");
      invalidate();
    },
    onError,
  });

  const updateVehicle = useMutation({
    mutationFn: ({
      vehicleId,
      dto,
    }: {
      vehicleId: string;
      dto: Partial<VehiclePayload>;
    }) =>
      updateRelationVehicleService(
        String(relationId),
        conjuntoId,
        vehicleId,
        dto,
      ),
    onSuccess: () => {
      showAlert("¡Vehículo actualizado exitosamente!", "success");
      invalidate();
    },
    onError,
  });

  const removeVehicle = useMutation({
    mutationFn: (vehicleId: string) =>
      removeRelationVehicleService(String(relationId), conjuntoId, vehicleId),
    onSuccess: () => {
      showAlert("¡Vehículo eliminado exitosamente!", "success");
      invalidate();
    },
    onError,
  });

  return { updateUserInfo, addVehicle, updateVehicle, removeVehicle };
}

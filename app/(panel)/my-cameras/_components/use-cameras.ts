import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCamera,
  deleteCamera,
  listCameraBrands,
  listCameras,
  lookupPlate,
  readPlate,
  updateCamera,
} from "../services/cameraService";
import {
  CreateCameraRequest,
  UpdateCameraRequest,
} from "../services/response/camera";
import { useAlertStore } from "@/app/components/store/useAlertStore";

export function useCamerasQuery(conjuntoId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["cameras", conjuntoId],
    queryFn: () => listCameras(conjuntoId),
    enabled: enabled && !!conjuntoId,
  });
}

export function useCreateCamera(conjuntoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCameraRequest) => createCamera(conjuntoId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cameras", conjuntoId] });
    },
  });
}

// Crear no lleva onError: el formulario ya pinta createMutation.error.
export function useUpdateCamera(conjuntoId: string) {
  const qc = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCameraRequest }) =>
      updateCamera(conjuntoId, id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cameras", conjuntoId] });
      // Encender o apagar la grabación cambia lo que se factura.
      qc.invalidateQueries({ queryKey: ["recording-usage", conjuntoId] });
    },
    onError: (error: Error) => {
      showAlert(error.message || "No se pudo actualizar la cámara", "error");
    },
  });
}

export function useDeleteCamera(conjuntoId: string) {
  const qc = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  return useMutation({
    mutationFn: (id: string) => deleteCamera(conjuntoId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cameras", conjuntoId] });
    },
    onError: (error: Error) => {
      showAlert(error.message || "No se pudo eliminar la cámara", "error");
    },
  });
}

/**
 * Son mutaciones y no consultas aunque solo lean: cada lectura con cámara es
 * una captura nueva (y una llamada al modelo que se cobra), así que no debe
 * repetirse sola al volver a la pestaña ni quedar en caché.
 */
export function useReadPlate(conjuntoId: string) {
  return useMutation({
    mutationFn: (cameraId: string) => readPlate(conjuntoId, cameraId),
  });
}

export function useLookupPlate(conjuntoId: string) {
  return useMutation({
    mutationFn: (plate: string) => lookupPlate(conjuntoId, plate),
  });
}

/**
 * Catálogo de marcas. Cambia sólo con un despliegue, así que no hace falta
 * revalidarlo mientras la pantalla esté abierta.
 */
export function useCameraBrandsQuery(conjuntoId: string, enabled: boolean) {
  return useQuery({
    queryKey: ["camera-brands"],
    queryFn: () => listCameraBrands(conjuntoId),
    enabled: enabled && !!conjuntoId,
    staleTime: Infinity,
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCamera,
  deleteCamera,
  listCameraBrands,
  listCameras,
} from "../services/cameraService";
import { CreateCameraRequest } from "../services/response/camera";

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

export function useDeleteCamera(conjuntoId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCamera(conjuntoId, id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cameras", conjuntoId] });
    },
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

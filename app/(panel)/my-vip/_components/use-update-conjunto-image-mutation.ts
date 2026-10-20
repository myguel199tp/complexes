"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  ConjuntoImageResponse,
  updateConjuntoImageService,
} from "../services/conjuntoImageService";

const QUERY_INFO = "query_info";

export function useUpdateConjuntoImageMutation() {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const setConjuntoImage = useConjuntoStore((state) => state.setConjuntoImage);

  return useMutation<ConjuntoImageResponse, Error, File>({
    mutationFn: (file) => updateConjuntoImageService(conjuntoId, file),
    onSuccess: ({ file }) => {
      // Los certificados y las PQR toman el logo del store, no de la consulta.
      setConjuntoImage(file);
      queryClient.invalidateQueries({ queryKey: [QUERY_INFO] });
      showAlert("Imagen del conjunto actualizada", "success");
    },
    onError: (error) => {
      showAlert(error.message || "No se pudo cambiar la imagen", "error");
    },
  });
}

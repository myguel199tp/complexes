"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SavedSignatureService } from "./services/savedSignatureService";

const api = new SavedSignatureService();

export const SAVED_SIGNATURE_KEY = ["saved-signature"];

export function useSavedSignature() {
  return useQuery({
    queryKey: SAVED_SIGNATURE_KEY,
    queryFn: () => api.get(),
    // Sin firma guardada se dibuja y ya: no vale la pena reintentar.
    retry: false,
  });
}

/**
 * Las dos mutaciones dejan la caché al día ellas mismas: la invalidación
 * global de providers.tsx recargaría todas las consultas de la pantalla por
 * una imagen que ya se tiene en la mano.
 */
export function useSaveSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dataUrl: string) => api.save(dataUrl),
    meta: { skipInvalidate: true },
    onSuccess: (_data, dataUrl) =>
      queryClient.setQueryData(SAVED_SIGNATURE_KEY, dataUrl),
  });
}

export function useRemoveSignature() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.remove(),
    meta: { skipInvalidate: true },
    onSuccess: () => queryClient.setQueryData(SAVED_SIGNATURE_KEY, null),
  });
}

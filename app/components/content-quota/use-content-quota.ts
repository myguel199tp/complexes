"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  ContentModule,
  ContentQuota,
  getContentQuota,
  purchaseContentPackage,
} from "./content-quota-service";

/**
 * Misma llave en el formulario y en el panel de paquetes: comparten la
 * consulta. Quien guarda noticias o documentos invalida `[CONTENT_QUOTA_KEY,
 * module]` para que el contador baje.
 */
export const CONTENT_QUOTA_KEY = "content-quota";

export function useContentQuota(module: ContentModule) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: [CONTENT_QUOTA_KEY, module, conjuntoId],
    queryFn: () => getContentQuota(module, String(conjuntoId)),
    enabled: !!conjuntoId,
  });
}

export function usePurchaseContentPackage(module: ContentModule) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const queryClient = useQueryClient();

  return useMutation<ContentQuota, Error, string>({
    mutationFn: (packageId: string) =>
      purchaseContentPackage(module, String(conjuntoId), packageId),
    onSuccess: (quota) => {
      queryClient.setQueryData([CONTENT_QUOTA_KEY, module, conjuntoId], quota);
    },
  });
}

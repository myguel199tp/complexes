import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useMutation } from "@tanstack/react-query";
import { attendAssemblyService } from "../services/assemblies.service";

export const useAttendAssemblyMutation = () => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useMutation({
    mutationFn: (assemblyId: string) =>
      attendAssemblyService(assemblyId, conjuntoId!),
  });
};

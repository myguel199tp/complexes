import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  allAssembliesService,
  assemblyDetailService,
  assemblyPollsService,
  assemblyResultsService,
  createPollService,
  deletePollService,
  updatePollService,
  voteInPollService,
} from "../services/assemblies.service";
import {
  CreatePollPayload,
  UpdatePollPayload,
} from "../services/assemblies.types";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export const useAssembliesQuery = () => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["assemblies", conjuntoId],
    queryFn: () => allAssembliesService(conjuntoId!),
    enabled: !!conjuntoId,
  });
};

export const useAssemblyDetailQuery = (id: string) => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["assembly", id, conjuntoId],
    queryFn: () => assemblyDetailService(id, conjuntoId!),
    enabled: !!id && !!conjuntoId,
  });
};

export const useAssemblyPollsQuery = (id: string) => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["assembly", id, "polls", conjuntoId],
    queryFn: () => assemblyPollsService(id, conjuntoId!),
    enabled: !!id && !!conjuntoId,
  });
};

export const useAssemblyResultsQuery = (id: string) => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useQuery({
    queryKey: ["assembly", id, "results", conjuntoId],
    queryFn: () => assemblyResultsService(id, conjuntoId!),
    enabled: !!id && !!conjuntoId,
  });
};

/**
 * Refresca preguntas y resultados de una asamblea.
 *
 * Las claves llevan el id de la ASAMBLEA (`useAssemblyPollsQuery`), no el de la
 * pregunta. Al votar se invalidaba con `variables.pollId`, que no coincide con
 * ninguna clave: la pantalla se quedaba con los datos viejos —incluido el
 * `editable` que decide si el orden del día todavía se puede corregir— hasta
 * que alguien recargaba.
 */
const useInvalidateAssembly = () => {
  const queryClient = useQueryClient();

  return (assemblyId: string) => {
    queryClient.invalidateQueries({
      queryKey: ["assembly", assemblyId, "polls"],
    });

    queryClient.invalidateQueries({
      queryKey: ["assembly", assemblyId, "results"],
    });
  };
};

export const useVoteMutation = (assemblyId: string) => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const invalidateAssembly = useInvalidateAssembly();

  return useMutation({
    mutationFn: (data: { pollId: string; optionId: string }) =>
      voteInPollService(data, conjuntoId!),

    onSuccess: () => invalidateAssembly(assemblyId),
  });
};

export const useCreatePollMutation = (assemblyId: string) => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const invalidateAssembly = useInvalidateAssembly();

  return useMutation({
    mutationFn: (data: CreatePollPayload) =>
      createPollService(assemblyId, data, conjuntoId!),

    onSuccess: () => invalidateAssembly(assemblyId),
  });
};

export const useUpdatePollMutation = (assemblyId: string) => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const invalidateAssembly = useInvalidateAssembly();

  return useMutation({
    mutationFn: ({
      pollId,
      data,
    }: {
      pollId: string;
      data: UpdatePollPayload;
    }) => updatePollService(assemblyId, pollId, data, conjuntoId!),

    onSuccess: () => invalidateAssembly(assemblyId),
  });
};

export const useDeletePollMutation = (assemblyId: string) => {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const invalidateAssembly = useInvalidateAssembly();

  return useMutation({
    mutationFn: (pollId: string) =>
      deletePollService(assemblyId, pollId, conjuntoId!),

    onSuccess: () => invalidateAssembly(assemblyId),
  });
};

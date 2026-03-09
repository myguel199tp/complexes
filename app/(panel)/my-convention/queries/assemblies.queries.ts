import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  allAssembliesService,
  assemblyDetailService,
  assemblyPollsService,
  assemblyResultsService,
  voteInPollService,
} from "../services/assemblies.service";
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

export const useVoteMutation = () => {
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return useMutation({
    mutationFn: (data: { pollId: string; optionId: string; userId: string }) =>
      voteInPollService(data, conjuntoId!),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["assembly", variables.pollId, "polls"],
      });

      queryClient.invalidateQueries({
        queryKey: ["assembly", variables.pollId, "results"],
      });
    },
  });
};

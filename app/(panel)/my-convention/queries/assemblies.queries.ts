import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  allAssembliesService,
  assemblyDetailService,
  assemblyPollsService,
  assemblyResultsService,
  voteInPollService,
} from "../services/assemblies.service";

// LISTA TODAS LAS ASAMBLEAS
export const useAssembliesQuery = () =>
  useQuery({
    queryKey: ["assemblies"],
    queryFn: allAssembliesService,
  });

// DETALLE DE ASAMBLEA
export const useAssemblyDetailQuery = (id: string) =>
  useQuery({
    queryKey: ["assembly", id],
    queryFn: () => assemblyDetailService(id),
    enabled: !!id,
  });

// ENCUESTAS DE ASAMBLEA
export const useAssemblyPollsQuery = (id: string) =>
  useQuery({
    queryKey: ["assembly", id, "polls"],
    queryFn: () => assemblyPollsService(id),
    enabled: !!id,
  });

// RESULTADOS
export const useAssemblyResultsQuery = (id: string) =>
  useQuery({
    queryKey: ["assembly", id, "results"],
    queryFn: () => assemblyResultsService(id),
    enabled: !!id,
  });

// MUTACIÓN DE VOTO
export const useVoteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: voteInPollService,

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

"use client";
import { useQuery } from "@tanstack/react-query";
import { CouncilService } from "../services/councilServices";

const api = new CouncilService();

export function useVoteQuery(id: string) {
  return useQuery({
    queryKey: ["council_vote", id],
    queryFn: () => api.getVote(id),
    enabled: !!id,
  });
}

export function useVoteResultsQuery(id: string) {
  return useQuery({
    queryKey: ["council_vote_results", id],
    queryFn: () => api.getVoteResults(id),
    enabled: !!id,
  });
}

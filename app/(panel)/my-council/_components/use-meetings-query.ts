"use client";
import { useQuery } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CouncilService } from "../services/councilServices";

const api = new CouncilService();

export function useMeetingsQuery() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const query = useQuery({
    queryKey: ["council_meetings", conjuntoId],
    queryFn: () => api.getMeetings(String(conjuntoId)),
    enabled: !!conjuntoId,
  });

  return { ...query, conjuntoId };
}

export function useMeetingQuery(id: string) {
  return useQuery({
    queryKey: ["council_meeting", id],
    queryFn: () => api.getMeeting(id),
    enabled: !!id,
  });
}

export function useMeetingVotesQuery(meetingId: string) {
  return useQuery({
    queryKey: ["council_meeting_votes", meetingId],
    queryFn: () => api.getVotesByMeeting(meetingId),
    enabled: !!meetingId,
  });
}

export function useMeetingMinutesQuery(meetingId: string) {
  return useQuery({
    queryKey: ["council_meeting_minutes", meetingId],
    queryFn: () => api.getMinutes(meetingId),
    enabled: !!meetingId,
  });
}

export function useMeetingSignaturesQuery(meetingId: string) {
  return useQuery({
    queryKey: ["council_meeting_signatures", meetingId],
    queryFn: () => api.getSignatures(meetingId),
    enabled: !!meetingId,
  });
}

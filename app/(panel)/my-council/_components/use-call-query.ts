"use client";
import { useQuery } from "@tanstack/react-query";
import { CouncilService } from "../services/councilServices";

const api = new CouncilService();

export function useCallStatusQuery(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: ["council_call_status", meetingId],
    queryFn: () => api.getCallStatus(meetingId),
    enabled: !!meetingId && enabled,
    refetchInterval: (data) =>
      data?.session?.status === "in-progress" ? 5000 : false,
  });
}

export function useRecordingUrlQuery(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: ["council_call_recording", meetingId],
    queryFn: () => api.getRecordingUrl(meetingId),
    enabled: !!meetingId && enabled,
  });
}

export function useMeetingHistoryQuery(meetingId: string, enabled = true) {
  return useQuery({
    queryKey: ["council_meeting_history", meetingId],
    queryFn: () => api.getFullHistory(meetingId),
    enabled: !!meetingId && enabled,
  });
}

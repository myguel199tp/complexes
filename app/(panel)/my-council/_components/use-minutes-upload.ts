"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { CouncilService } from "../services/councilServices";

const api = new CouncilService();

/** Si quien entró es presidente, vicepresidente o secretario del consejo. */
export function useCanUploadMinutes() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const { data } = useQuery({
    queryKey: ["council_me", conjuntoId],
    queryFn: () => api.getMyCouncilRole(),
    enabled: !!conjuntoId,
    staleTime: 5 * 60 * 1000,
  });

  return !!data?.canUploadMinutes;
}

/** La lista, el estado y la reunión cambian al cargar un acta. */
function useInvalidateMeeting() {
  const queryClient = useQueryClient();
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  return (meetingId: string) => {
    queryClient.invalidateQueries({ queryKey: ["council_meetings", conjuntoId] });
    queryClient.invalidateQueries({ queryKey: ["council_status", conjuntoId] });
    queryClient.invalidateQueries({ queryKey: ["council_meeting", meetingId] });
    queryClient.invalidateQueries({
      queryKey: ["council_meeting_minutes", meetingId],
    });
    queryClient.invalidateQueries({
      queryKey: ["council_meeting_signatures", meetingId],
    });
  };
}

export function useRecordMeetingMutation() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const invalidate = useInvalidateMeeting();

  return useMutation({
    mutationFn: (form: FormData) => api.recordMeeting(form),
    onSuccess: ({ meeting }) => {
      showAlert(
        "Reunión registrada. Los miembros del consejo ya pueden firmar el acta.",
        "success",
      );
      invalidate(meeting.id);
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al registrar la reunión", "error");
    },
  });
}

export function useUploadMinutesMutation() {
  const showAlert = useAlertStore((state) => state.showAlert);
  const invalidate = useInvalidateMeeting();

  return useMutation({
    mutationFn: ({ meetingId, form }: { meetingId: string; form: FormData }) =>
      api.uploadMinutesDocument(meetingId, form),
    onSuccess: (_, { meetingId }) => {
      showAlert("Acta cargada. Ya se puede firmar.", "success");
      invalidate(meetingId);
    },
    onError: (error: Error) => {
      showAlert(error.message || "Error al cargar el acta", "error");
    },
  });
}

export function useOpenMinutesDocument() {
  const showAlert = useAlertStore((state) => state.showAlert);

  return (meetingId: string) =>
    api
      .openMinutesDocument(meetingId)
      .catch((error: Error) => showAlert(error.message, "error"));
}

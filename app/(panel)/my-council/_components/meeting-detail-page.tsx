"use client";
import Link from "next/link";
import { useMeetingQuery } from "./use-meetings-query";
import MeetingDetail from "./meeting-detail";

interface Props {
  meetingId: string;
}

export default function MeetingDetailPage({ meetingId }: Props) {
  const { data: meeting, isLoading, isError } = useMeetingQuery(meetingId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isError || !meeting) {
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-4">
        <Link
          href="/my-council"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Volver al consejo
        </Link>
        <p className="text-sm text-red-500">No se pudo cargar la reunión.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <Link
        href="/my-council"
        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
      >
        ← Volver al consejo
      </Link>

      <div>
        <h1 className="text-xl font-bold text-gray-900">{meeting.title}</h1>
        {meeting.description && (
          <p className="text-sm text-gray-500 mt-1">{meeting.description}</p>
        )}
        {meeting.date && (
          <p className="text-xs text-gray-400 mt-1">
            {new Date(meeting.date).toLocaleDateString("es-CO", {
              dateStyle: "medium",
            })}
          </p>
        )}
      </div>

      <MeetingDetail meeting={meeting} />
    </div>
  );
}

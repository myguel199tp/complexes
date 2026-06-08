"use client";
import { useState } from "react";
import { Button } from "complexes-next-components";
import { MeetingResponse } from "../services/response/councilResponse";
import { useMeetingsQuery } from "./use-meetings-query";
import CreateMeetingForm from "./create-meeting-form";
import MeetingDetail from "./meeting-detail";

const STATUS_DOT: Record<MeetingResponse["status"], string> = {
  pending: "bg-yellow-400",
  ongoing: "bg-green-500 animate-pulse",
  finished: "bg-gray-400",
};

const STATUS_LABEL: Record<MeetingResponse["status"], string> = {
  pending: "Pendiente",
  ongoing: "En curso",
  finished: "Finalizada",
};

const STATUS_BADGE: Record<MeetingResponse["status"], string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  ongoing: "bg-green-50 text-green-700 border-green-200",
  finished: "bg-gray-50 text-gray-500 border-gray-200",
};

export default function MeetingsPanel() {
  const { data: meetings = [], isLoading } = useMeetingsQuery();
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const sorted = [...meetings].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const toggle = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="space-y-4">
      {/* ── Crear reunión ── */}
      {showCreate ? (
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
          <div className="flex items-center justify-between px-6 pt-4 pb-2">
            <p className="font-semibold text-gray-900">Nueva reunión</p>
            <button
              type="button"
              onClick={() => setShowCreate(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Cancelar
            </button>
          </div>
          <CreateMeetingForm onSuccess={() => setShowCreate(false)} />
        </div>
      ) : (
        <Button
          size="sm"
          colVariant="success"
          rounded="md"
          onClick={() => setShowCreate(true)}
        >
          + Nueva reunión
        </Button>
      )}

      {/* ── Lista de reuniones ── */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
        </div>
      ) : sorted.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-10">
          No hay reuniones registradas.
        </p>
      ) : (
        <div className="space-y-3">
          {sorted.map((meeting) => {
            const isOpen = expandedId === meeting.id;
            return (
              <div
                key={meeting.id}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white"
              >
                {/* Header */}
                <button
                  type="button"
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  onClick={() => toggle(meeting.id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`shrink-0 w-2.5 h-2.5 rounded-full ${STATUS_DOT[meeting.status]}`}
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {meeting.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {meeting.date
                          ? new Date(meeting.date).toLocaleDateString("es-CO", {
                              dateStyle: "medium",
                            })
                          : "Sin fecha"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span
                      className={`hidden sm:inline text-xs px-2.5 py-0.5 rounded-full border font-medium ${STATUS_BADGE[meeting.status]}`}
                    >
                      {STATUS_LABEL[meeting.status]}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </button>

                {/* Detail expandido */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-3 border-t border-gray-100 bg-gray-50">
                    {meeting.description && (
                      <p className="text-sm text-gray-500 mb-4">
                        {meeting.description}
                      </p>
                    )}
                    <MeetingDetail meeting={meeting} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

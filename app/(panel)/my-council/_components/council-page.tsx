"use client";
import { useState } from "react";
import { useCouncilStatusQuery } from "./use-council-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import CouncilInitializer from "./council-initializer";
import MembersPanel from "./members-panel";
import MeetingsPanel from "./meetings-panel";
import MeetingDetail from "./meeting-detail";

type Tab = "members" | "meetings";

const TABS: { key: Tab; label: string }[] = [
  { key: "members", label: "Miembros" },
  { key: "meetings", label: "Reuniones" },
];

const CAN_INITIALIZE = ["employee", "admin", "manager"];

export default function CouncilPage() {
  const { data: status, isLoading } = useCouncilStatusQuery();
  const role = useConjuntoStore((state) => state.role);
  const [tab, setTab] = useState<Tab>("members");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!status) return null;

  const ongoingMeetingBanner = status.ongoingMeeting && (
    <div className="border border-green-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-3 px-5 py-4 bg-green-50 border-b border-green-100">
        <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0" />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {status.ongoingMeeting.title}
          </p>
          <p className="text-xs text-gray-500">Reunión en curso</p>
        </div>
      </div>
      <div className="p-5">
        {status.ongoingMeeting.description && (
          <p className="text-sm text-gray-500 mb-4">
            {status.ongoingMeeting.description}
          </p>
        )}
        <MeetingDetail meeting={status.ongoingMeeting} />
      </div>
    </div>
  );

  if (!status.hasPresident) {
    const hasMeetingActivity =
      !!status.ongoingMeeting ||
      status.pendingMeetings.length > 0 ||
      status.recentFinishedMeetings.length > 0;

    if (CAN_INITIALIZE.includes(role ?? "")) {
      return (
        <div className="max-w-4xl mx-auto p-4 space-y-6">
          {ongoingMeetingBanner}
          <CouncilInitializer />
        </div>
      );
    }
    return (
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {ongoingMeetingBanner}
        {!hasMeetingActivity && (
          <div className="flex flex-col items-center justify-center p-16 text-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center text-2xl">
              ⚖️
            </div>
            <p className="text-gray-700 font-medium">
              El consejo de administración aún no ha sido inicializado.
            </p>
            <p className="text-sm text-gray-400">
              Comunícate con el administrador para activarlo.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Consejo de Administración
          </h1>
          {status.president && (
            <p className="text-sm text-gray-500 mt-0.5">
              Presidente:{" "}
              <span className="font-medium text-gray-700">
                {status.president.userId.slice(0, 8)}…
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Activo · {status.totalMembers} miembro
            {status.totalMembers !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {ongoingMeetingBanner}

      {/* Tabs */}
      <div className="flex gap-0 border-b border-gray-200">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {tab === "members" && <MembersPanel />}
      {tab === "meetings" && <MeetingsPanel />}
    </div>
  );
}

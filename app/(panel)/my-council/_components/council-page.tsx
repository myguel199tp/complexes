"use client";
import { useState } from "react";
import { useCouncilStatusQuery } from "./use-council-query";
import CouncilInitializer from "./council-initializer";
import MembersPanel from "./members-panel";
import MeetingsPanel from "./meetings-panel";

type Tab = "members" | "meetings";

const TABS: { key: Tab; label: string }[] = [
  { key: "members", label: "Miembros" },
  { key: "meetings", label: "Reuniones" },
];

export default function CouncilPage() {
  const { data: status, isLoading } = useCouncilStatusQuery();
  const [tab, setTab] = useState<Tab>("members");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!status?.active) {
    return <CouncilInitializer />;
  }

  const president = status.members.find((m) => m.role === "president");

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Consejo de Administración
          </h1>
          {president && (
            <p className="text-sm text-gray-500 mt-0.5">
              Presidente:{" "}
              <span className="font-medium text-gray-700">
                {president.userId.slice(0, 8)}…
              </span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Activo · {status.members.length} miembro
            {status.members.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

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

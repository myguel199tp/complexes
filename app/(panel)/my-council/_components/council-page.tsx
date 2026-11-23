"use client";
import { ReactNode, useState } from "react";
import { Tabs } from "@/app/components/ui/form";
import { useCouncilStatusQuery } from "./use-council-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import CouncilInitializer from "./council-initializer";
import MembersPanel from "./members-panel";
import MeetingsPanel from "./meetings-panel";
import MeetingDetail from "./meeting-detail";
import { Text } from "complexes-next-components";
import { canManageCouncil } from "./council-permissions";
import ConvivenciaPage from "@/app/(panel)/my-convivencia/_components/convivencia-page";
import AdminSuccessionPanel from "./admin-succession-panel";

type Tab = "members" | "meetings" | "convivencia" | "administration";

const TABS: { key: Tab; label: string }[] = [
  { key: "members", label: "Miembros" },
  { key: "meetings", label: "Reuniones" },
  // El comité de convivencia y sus casos; la misma pantalla de /my-convivencia.
  { key: "convivencia", label: "Convivencia" },
  // Quién es la administración; el presidente hace aquí el cambio.
  { key: "administration", label: "Administración" },
];

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
          <Text size="sm" font="semi" className="text-gray-900">
            {status.ongoingMeeting.title}
          </Text>
          <Text size="xs" className="text-gray-500">
            Reunión en curso
          </Text>
        </div>
      </div>
      <div className="p-5">
        {status.ongoingMeeting.description && (
          <Text size="sm" className="text-gray-500 mb-4">
            {status.ongoingMeeting.description}
          </Text>
        )}
        <MeetingDetail meeting={status.ongoingMeeting} />
      </div>
    </div>
  );

  // El consejo está "sin inicializar" cuando no tiene ningún miembro, no
  // cuando le falta presidente: `initializeCouncil` los crea a todos con
  // `role: null`, así que con el gate anterior (`!hasPresident`) se volvía a
  // esta pantalla después de inicializar y no quedaba forma de nombrar al
  // primer presidente desde la UI —la pestaña Miembros y la elección de
  // emergencia vivían justamente detrás de este mismo gate.
  if (status.totalMembers === 0) {
    const hasMeetingActivity =
      !!status.ongoingMeeting ||
      status.pendingMeetings.length > 0 ||
      status.recentFinishedMeetings.length > 0;

    if (canManageCouncil(role)) {
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
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-2xl">
              ⚖️
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              El consejo de administración aún no ha sido inicializado.
            </p>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Comunícate con el administrador para activarlo.
            </p>
          </div>
        )}
      </div>
    );
  }

  const content: Record<Tab, ReactNode> = {
    members: <MembersPanel />,
    meetings: <MeetingsPanel />,
    convivencia: <ConvivenciaPage embedded />,
    administration: <AdminSuccessionPanel />,
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header. El Text de la librería no trae color propio y en el tema
          oscuro el título quedaba negro sobre el fondo del panel. */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
            Consejo de Administración
          </h1>
          {status.president && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Presidente:{" "}
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {status.president.name ??
                  `${status.president.userId.slice(0, 8)}…`}
              </span>
            </p>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Activo · {status.totalMembers} miembro
          {status.totalMembers !== 1 ? "s" : ""}
        </span>
      </div>

      {!status.hasPresident && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          El consejo aún no tiene presidente. Asígnalo en la pestaña
          <span className="font-semibold"> Miembros</span>, o inicia una reunión
          para elegirlo por votación.
        </div>
      )}

      {ongoingMeetingBanner}

      {/* Las cuatro pestañas no caben en el teléfono: antes desbordaban la
          página y "Convivencia" quedaba cortada. Ahora la fila se desliza. */}
      <Tabs
        themed
        activeIndex={Math.max(
          0,
          TABS.findIndex(({ key }) => key === tab),
        )}
        onChange={(index) => setTab(TABS[index].key)}
        panelClassName="mt-6"
        tabs={TABS.map(({ key, label }) => ({
          label,
          children: content[key],
        }))}
      />
    </div>
  );
}

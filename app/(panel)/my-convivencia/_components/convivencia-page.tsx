"use client";

import { ReactNode, useState } from "react";
import { EmptyState, LoadingCards, ui } from "@/app/(panel)/my-b2b/_components/b2b-ui";
import { Tabs } from "@/app/components/ui/form";
import { useConvivenciaMe } from "./use-convivencia";
import CaseList from "./case-list";
import NewCaseForm from "./new-case-form";
import CaseDetailView from "./case-detail";
import CommitteePanel from "./committee-panel";

type Tab = "cases" | "new" | "committee";

/**
 * Convivencia: radicar casos, la mediación del comité, descargos, acta,
 * sanción y apelación. La misma pantalla vive suelta (/my-convivencia, para
 * cualquier residente) y dentro del consejo (`embedded`).
 */
export default function ConvivenciaPage({ embedded = false }: { embedded?: boolean }) {
  const { data: me, isLoading, error } = useConvivenciaMe();
  const [tab, setTab] = useState<Tab>("cases");
  const [openCase, setOpenCase] = useState<string | null>(null);

  if (isLoading) return <LoadingCards count={2} />;

  if (error || !me) {
    return (
      <EmptyState icon="⚠️" title="Convivencia no está disponible">
        {(error as Error)?.message ?? "Intenta de nuevo más tarde."}
      </EmptyState>
    );
  }

  const seesAll = me.isAdmin || me.isMediator || me.isPresident;

  const tabs: { key: Tab; label: string }[] = [
    { key: "cases", label: seesAll ? "Casos" : "Mis casos" },
    ...(me.canFile ? [{ key: "new" as Tab, label: "Radicar caso" }] : []),
    { key: "committee", label: "Comité" },
  ];

  const content: Record<Tab, ReactNode> = {
    cases: <CaseList seesAll={seesAll} onOpen={setOpenCase} />,
    new: (
      <NewCaseForm
        me={me}
        onCreated={(caseId) => {
          setTab("cases");
          setOpenCase(caseId);
        }}
      />
    ),
    committee: <CommitteePanel isAdmin={me.isAdmin} />,
  };

  return (
    <div className={embedded ? "space-y-5" : "mx-auto max-w-5xl space-y-5 p-4"}>
      {!embedded && (
        <header>
          <h1 className={`text-xl font-bold sm:text-2xl ${ui.title}`}>Convivencia</h1>
          <p className={`mt-1 text-sm ${ui.muted}`}>
            El comité de convivencia media los conflictos entre vecinos y levanta un acta.
            No sanciona: si no hay acuerdo, remite el caso a la administración.
          </p>
        </header>
      )}

      {openCase ? (
        <CaseDetailView caseId={openCase} onBack={() => setOpenCase(null)} />
      ) : (
        <>
          {/* Una sola fila que se desliza: con botones flex que se encogían,
              en el teléfono "Mis casos" y "Radicar caso" se partían en dos
              líneas. Dentro del consejo van más pequeñas, para que no se
              confundan con las pestañas del consejo que quedan encima. */}
          <Tabs
            themed
            size={embedded ? "sm" : "md"}
            activeIndex={Math.max(
              0,
              tabs.findIndex(({ key }) => key === tab),
            )}
            onChange={(index) => setTab(tabs[index].key)}
            panelClassName="mt-5"
            tabs={tabs.map(({ key, label }) => ({
              label,
              children: content[key],
            }))}
          />
        </>
      )}
    </div>
  );
}

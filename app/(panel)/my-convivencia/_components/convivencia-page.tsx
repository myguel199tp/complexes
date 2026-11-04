"use client";

import { useState } from "react";
import { EmptyState, LoadingCards, ui } from "@/app/(panel)/my-b2b/_components/b2b-ui";
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
          <div className="flex gap-0 border-b border-slate-200 dark:border-white/10">
            {tabs.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                  tab === key
                    ? "border-cyan-600 text-cyan-700 dark:border-cyan-400 dark:text-cyan-300"
                    : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === "cases" && <CaseList seesAll={seesAll} onOpen={setOpenCase} />}
          {tab === "new" && (
            <NewCaseForm
              me={me}
              onCreated={(caseId) => {
                setTab("cases");
                setOpenCase(caseId);
              }}
            />
          )}
          {tab === "committee" && <CommitteePanel isAdmin={me.isAdmin} />}
        </>
      )}
    </div>
  );
}

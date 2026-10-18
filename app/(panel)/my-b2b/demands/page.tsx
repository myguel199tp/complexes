"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "complexes-next-components";
import {
  HiOutlineBuildingOffice2,
  HiOutlineHome,
  HiOutlineMegaphone,
} from "react-icons/hi2";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { SelectField } from "@/app/components/ui/form";
import { DemandFormModal } from "./_components/demand-form-modal";
import {
  B2B_DEMAND_CATEGORIES,
  B2bDemand,
  B2bDemandCategory,
  CreateB2bDemandPayload,
  DEMAND_STATUS_LABELS,
  DEMAND_STATUS_TONE,
  createB2bDemand,
  demandCategoryLabel,
  getB2bDemands,
  getMyB2bDemands,
  joinB2bDemand,
} from "../services/b2bDemandService";
import {
  EmptyState,
  LoadingCards,
  PageHeader,
  Pill,
  fmtDate,
  ui,
} from "../_components/b2b-ui";
import { GroupProgress } from "../_components/group-progress";

type Tab = "feed" | "mine";

function DemandCard({
  demand,
  onJoin,
  isJoining,
}: {
  demand: B2bDemand;
  onJoin: (demand: B2bDemand) => void;
  isJoining: boolean;
}) {
  return (
    <article className={`${ui.card} flex flex-col p-4 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-cyan-700 dark:text-cyan-300">
          {demandCategoryLabel(demand)}
        </p>
        <Pill tone={DEMAND_STATUS_TONE[demand.status]}>
          {DEMAND_STATUS_LABELS[demand.status]}
        </Pill>
      </div>

      <Link
        href={`/my-b2b/demands/${demand.id}`}
        className={`mt-1 font-semibold hover:underline ${ui.strong}`}
      >
        {demand.title}
      </Link>
      <p className={`text-xs ${ui.muted}`}>
        {demand.city} ·{" "}
        {demand.isOwner ? "Publicada por tu conjunto" : (demand.conjuntoName ?? "Otro conjunto")}
      </p>
      <p className={`mt-2 line-clamp-2 text-sm ${ui.text}`}>{demand.description}</p>

      {demand.joinDeadline && !demand.group ? (
        <p
          className={`mt-2 text-xs font-semibold ${
            demand.joinsOpen
              ? (demand.daysToClose ?? 99) <= 7
                ? "text-amber-700 dark:text-amber-300"
                : "text-cyan-700 dark:text-cyan-300"
              : ui.muted
          }`}
        >
          {demand.joinsOpen
            ? demand.daysToClose === 0
              ? "Las adhesiones cierran hoy"
              : `Puedes sumarte hasta el ${fmtDate(demand.joinDeadline, true)} (${demand.daysToClose} días)`
            : "Adhesiones cerradas: el club está negociando con este volumen"}
        </p>
      ) : null}

      {/* El volumen es el argumento de la negociación: va siempre visible. */}
      <div className="mt-3 flex flex-wrap gap-4">
        <span className={`inline-flex items-center gap-1.5 text-sm ${ui.strong}`}>
          <HiOutlineBuildingOffice2 className="text-cyan-600 dark:text-cyan-300" />
          <strong>{demand.totalConjuntos}</strong>
          {demand.totalConjuntos === 1 ? "conjunto" : "conjuntos"}
        </span>
        {demand.totalApartamentos > 0 ? (
          <span className={`inline-flex items-center gap-1.5 text-sm ${ui.strong}`}>
            <HiOutlineHome className="text-cyan-600 dark:text-cyan-300" />
            <strong>{demand.totalApartamentos}</strong> apartamentos
          </span>
        ) : null}
      </div>

      {demand.group ? (
        <div className="mt-3">
          <GroupProgress group={demand.group} compact />
        </div>
      ) : null}

      <div className={`mt-4 flex flex-wrap items-center gap-3 border-t pt-3 ${ui.divider}`}>
        {!demand.isOwner && !demand.hasJoined && demand.joinsOpen ? (
          <Button
            colVariant="primary"
            size="xs"
            rounded="md"
            disabled={isJoining}
            onClick={() => onJoin(demand)}
          >
            Sumar mi conjunto
          </Button>
        ) : null}
        {demand.hasJoined ? <Pill tone="success">Tu conjunto está sumado</Pill> : null}
        <Link href={`/my-b2b/demands/${demand.id}`} className={`ml-auto text-sm ${ui.link}`}>
          Ver detalle →
        </Link>
      </div>
    </article>
  );
}

/**
 * Compra en grupo: publicar lo que el conjunto necesita y sumarse a lo que
 * piden otros. Cuando varios conjuntos de la misma ciudad coinciden en un
 * servicio, el club negocia un solo precio por el volumen de todos.
 */
export default function MyB2bDemandsPage() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((s) => s.showAlert);

  const [tab, setTab] = useState<Tab>("feed");
  const [category, setCategory] = useState<string>("");
  const [isFormOpen, setFormOpen] = useState(false);

  const feed = useQuery({
    queryKey: ["b2b_demands_feed", conjuntoId, category],
    queryFn: () =>
      getB2bDemands(conjuntoId, {
        category: (category || undefined) as B2bDemandCategory | undefined,
      }),
    enabled: !!conjuntoId && tab === "feed",
  });

  const mine = useQuery({
    queryKey: ["b2b_demands_mine", conjuntoId],
    queryFn: () => getMyB2bDemands(conjuntoId),
    enabled: !!conjuntoId && tab === "mine",
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["b2b_demands_feed"] });
    queryClient.invalidateQueries({ queryKey: ["b2b_demands_mine"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateB2bDemandPayload) => createB2bDemand(conjuntoId, payload),
    onSuccess: () => {
      setFormOpen(false);
      invalidate();
      showAlert("Necesidad publicada", "success");
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => joinB2bDemand(conjuntoId, id),
    onSuccess: () => {
      invalidate();
      showAlert("Tu conjunto quedó sumado a la convocatoria", "success");
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const list = tab === "feed" ? feed.data : mine.data;
  const isLoading = tab === "feed" ? feed.isLoading : mine.isLoading;

  return (
    <div className="w-full min-w-0 p-2">
      <PageHeader
        title="Compra en grupo"
        description="Publica lo que tu conjunto necesita contratar y súmate a lo que piden otros. Entre más conjuntos y apartamentos se junten, más fuerza hay para negociar el precio."
        actions={
          <Button colVariant="primary" size="sm" rounded="md" onClick={() => setFormOpen(true)}>
            Publicar necesidad
          </Button>
        }
      />

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(
            [
              { key: "feed", label: "Convocatorias abiertas" },
              { key: "mine", label: "Las de mi conjunto" },
            ] as const
          ).map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                tab === t.key
                  ? "border-cyan-600 bg-cyan-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:text-slate-900 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400 dark:hover:text-slate-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "feed" ? (
          <div className="w-full sm:w-72">
            <SelectField
              aria-label="Filtrar por servicio"
              options={B2B_DEMAND_CATEGORIES.map((c) => ({
                label: c.label,
                value: c.value,
              }))}
              defaultOption="Todos los servicios"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              inputSize="sm"
              rounded="md"
            />
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <LoadingCards />
      ) : list && list.length > 0 ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          {list.map((demand) => (
            <DemandCard
              key={demand.id}
              demand={demand}
              isJoining={joinMutation.isLoading}
              onJoin={(d) => joinMutation.mutate(d.id)}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<HiOutlineMegaphone />}
          title={
            tab === "feed"
              ? "No hay convocatorias abiertas en tu ciudad"
              : "Tu conjunto aún no participa en ninguna"
          }
          action={
            <Button colVariant="primary" size="sm" rounded="md" onClick={() => setFormOpen(true)}>
              Publicar la primera
            </Button>
          }
        >
          Publica lo que necesitas y deja que otros conjuntos se sumen: el
          volumen es lo que baja el precio.
        </EmptyState>
      )}

      <DemandFormModal
        isOpen={isFormOpen}
        onClose={() => setFormOpen(false)}
        isSaving={createMutation.isLoading}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />
    </div>
  );
}

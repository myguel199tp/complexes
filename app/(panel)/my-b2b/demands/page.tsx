"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, SelectField, Title, Text } from "complexes-next-components";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { B2bNav } from "../_components/b2b-nav";
import { DemandFormModal } from "./_components/demand-form-modal";
import {
  B2B_DEMAND_CATEGORIES,
  B2bDemand,
  B2bDemandCategory,
  CreateB2bDemandPayload,
  DEMAND_STATUS_COLORS,
  DEMAND_STATUS_LABELS,
  createB2bDemand,
  demandCategoryLabel,
  getB2bDemands,
  getMyB2bDemands,
  joinB2bDemand,
} from "../services/b2bDemandService";

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
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 flex flex-col sm:flex-row justify-between gap-3">
      <div className="min-w-0">
        <Text size="xs" className="text-cyan-300">{demandCategoryLabel(demand)}</Text>
        <Link
          href={`/my-b2b/demands/${demand.id}`}
          className="font-semibold text-slate-100 hover:text-cyan-200"
        >
          {demand.title}
        </Link>
        <Text size="xs" className="text-slate-400 mt-1">
          {demand.city} ·{" "}
          {demand.isOwner
            ? "Publicada por tu conjunto"
            : (demand.conjuntoName ?? "Otro conjunto")}
          <span className={`ml-2 ${DEMAND_STATUS_COLORS[demand.status]}`}>
            {DEMAND_STATUS_LABELS[demand.status]}
          </span>
        </Text>
        <Text size="sm" className="text-slate-400 mt-2 line-clamp-2">
          {demand.description}
        </Text>

        {/* El volumen es el argumento de la negociación: va siempre visible. */}
        <Text size="xs" className="text-slate-200 mt-2">
          <strong>{demand.totalConjuntos}</strong>{" "}
          {demand.totalConjuntos === 1 ? "conjunto" : "conjuntos"}
          {demand.totalApartamentos > 0
            ? ` · ${demand.totalApartamentos} apartamentos`
            : ""}
        </Text>
      </div>

      <div className="flex sm:flex-col gap-2 shrink-0">
        {!demand.isOwner && !demand.hasJoined ? (
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

        {demand.hasJoined ? (
          <span className="text-emerald-400 text-xs self-center">
            Tu conjunto está sumado
          </span>
        ) : null}

        <Link
          href={`/my-b2b/demands/${demand.id}`}
          className="text-cyan-300 text-xs hover:text-cyan-200 self-center"
        >
          Ver detalle →
        </Link>
      </div>
    </div>
  );
}

/**
 * Necesidades de servicio del conjunto: el registro que faltaba para que la
 * compra agregada que promete /us/marketclub tenga de dónde salir.
 *
 * Solo el usuario con rol `employee` llega hasta aquí (el enlace del panel y
 * los endpoints del backend lo exigen).
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
    mutationFn: (payload: CreateB2bDemandPayload) =>
      createB2bDemand(conjuntoId, payload),
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
    <div className="w-full p-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Title size="sm" font="bold" className="text-white">
            Necesidades del conjunto
          </Title>
          <Text size="sm" className="text-slate-400 mt-1">
            Publica lo que tu conjunto necesita contratar. Cuando varios
            conjuntos de tu ciudad coinciden en el mismo servicio, el club
            negocia un solo precio por el volumen de todos.
          </Text>
        </div>
        <Button
          colVariant="primary"
          size="sm"
          rounded="md"
          className="shrink-0"
          onClick={() => setFormOpen(true)}
        >
          Publicar necesidad
        </Button>
      </div>

      <B2bNav />

      <div className="flex flex-wrap items-end gap-3 mt-4">
        <div className="flex gap-2">
          <Button
            colVariant={tab === "feed" ? "primary" : "default"}
            size="xs"
            rounded="md"
            onClick={() => setTab("feed")}
          >
            Convocatorias abiertas
          </Button>
          <Button
            colVariant={tab === "mine" ? "primary" : "default"}
            size="xs"
            rounded="md"
            onClick={() => setTab("mine")}
          >
            Las de mi conjunto
          </Button>
        </div>

        {tab === "feed" ? (
          <SelectField
            options={B2B_DEMAND_CATEGORIES.map((c) => ({
              label: c.label,
              value: c.value,
            }))}
            defaultOption="Todos los servicios"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            sizeHelp="xs"
            inputSize="sm"
            rounded="md"
          />
        ) : null}
      </div>

      {isLoading ? (
        <Text size="sm" className="text-slate-400 mt-6">Cargando...</Text>
      ) : list && list.length > 0 ? (
        <div className="grid gap-3 mt-6">
          {list.map((demand) => (
            <DemandCard
              key={demand.id}
              demand={demand}
              isJoining={joinMutation.isPending}
              onJoin={(d) => joinMutation.mutate(d.id)}
            />
          ))}
        </div>
      ) : (
        <Text size="sm" className="text-slate-400 mt-6">
          {tab === "feed"
            ? "Todavía no hay convocatorias abiertas en tu ciudad. Publica la primera y deja que otros conjuntos se sumen."
            : "Tu conjunto aún no ha publicado ninguna necesidad ni se ha sumado a otra."}
        </Text>
      )}

      <DemandFormModal
        isOpen={isFormOpen}
        onClose={() => setFormOpen(false)}
        isSaving={createMutation.isPending}
        onSubmit={(payload) => createMutation.mutate(payload)}
      />
    </div>
  );
}

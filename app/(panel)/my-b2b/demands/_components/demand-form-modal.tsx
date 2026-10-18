"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, Modal } from "complexes-next-components";
import { HiOutlineUserGroup } from "react-icons/hi2";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import {
  B2B_DEMAND_CATEGORIES,
  B2bDemand,
  B2bDemandCategory,
  CreateB2bDemandPayload,
  DEMAND_DESCRIPTION_MIN,
  DEMAND_JOIN_DEFAULT_DAYS,
  DEMAND_JOIN_MAX_DAYS,
  DEMAND_JOIN_MIN_DAYS,
  demandCategoryLabel,
  getSimilarB2bDemands,
} from "../../services/b2bDemandService";
import { fmtDate, modal } from "../../_components/b2b-ui";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Cuando viene, el modal edita esa convocatoria en vez de crear una nueva. */
  demand?: B2bDemand | null;
  isSaving: boolean;
  onSubmit: (payload: CreateB2bDemandPayload) => void;
}

const DAY_MS = 86_400_000;
const isoIn = (days: number) =>
  new Date(Date.now() + days * DAY_MS).toISOString().slice(0, 10);

const EMPTY = {
  category: "" as B2bDemandCategory | "",
  categoryOther: "",
  title: "",
  description: "",
  desiredStartDate: "",
  joinDeadline: isoIn(DEMAND_JOIN_DEFAULT_DAYS),
  currentMonthlyCost: "",
};

/**
 * Alta y edición de una necesidad de servicio.
 *
 * Antes de publicar muestra las convocatorias iguales que ya hay en la zona:
 * publicar otra parte el volumen en dos, y el volumen es lo que baja el
 * precio. Al editar, la categoría queda bloqueada y el cierre solo se puede
 * correr hacia adelante.
 *
 * El modal de la librería es blanco en los dos temas: todo usa `modal.*`.
 */
export function DemandFormModal({ isOpen, onClose, demand, isSaving, onSubmit }: Props) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const isEdit = !!demand;
  const [form, setForm] = useState(EMPTY);
  const [force, setForce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setForce(false);
    setForm(
      demand
        ? {
            category: demand.category,
            categoryOther: demand.categoryOther ?? "",
            title: demand.title,
            description: demand.description,
            desiredStartDate: demand.desiredStartDate?.slice(0, 10) ?? "",
            joinDeadline:
              demand.joinDeadline?.slice(0, 10) ?? isoIn(DEMAND_JOIN_DEFAULT_DAYS),
            currentMonthlyCost:
              demand.myCurrentMonthlyCost != null ? String(demand.myCurrentMonthlyCost) : "",
          }
        : { ...EMPTY, joinDeadline: isoIn(DEMAND_JOIN_DEFAULT_DAYS) },
    );
  }, [isOpen, demand]);

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const category = form.category as B2bDemandCategory;
  const { data: similar } = useQuery({
    queryKey: ["b2b_demands_similar", conjuntoId, category],
    queryFn: () => getSimilarB2bDemands(conjuntoId, category),
    enabled: isOpen && !isEdit && !!conjuntoId && !!category && category !== "otro",
  });
  const hasSimilar = !isEdit && !!similar?.length;

  const missingDescription = Math.max(
    0,
    DEMAND_DESCRIPTION_MIN - form.description.trim().length,
  );

  const handleSubmit = () => {
    if (!form.category) return setError("Elige el servicio que necesitas.");
    if (form.category === "otro" && !form.categoryOther.trim()) {
      return setError("Escribe qué servicio necesitas.");
    }
    if (form.title.trim().length < 10) {
      return setError("El título debe tener al menos 10 caracteres.");
    }
    if (missingDescription > 0) {
      return setError(`Faltan ${missingDescription} caracteres en la descripción.`);
    }
    if (hasSimilar && !force) {
      return setError(
        "Ya hay una convocatoria igual en tu zona: súmate, o marca que publicarás la tuya de todas formas.",
      );
    }

    setError(null);
    onSubmit({
      category,
      categoryOther: form.category === "otro" ? form.categoryOther.trim() : undefined,
      title: form.title.trim(),
      description: form.description.trim(),
      desiredStartDate: form.desiredStartDate || undefined,
      joinDeadline: form.joinDeadline || undefined,
      currentMonthlyCost: form.currentMonthlyCost
        ? Number(form.currentMonthlyCost)
        : undefined,
      force: hasSimilar ? force : undefined,
    });
  };

  return (
    <Modal
      className="w-11/12 max-w-lg max-h-[90vh] overflow-y-auto"
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Editar necesidad" : "Publicar una necesidad"}
    >
      <div className="space-y-4">
        {!isEdit ? (
          <p className={modal.text}>
            Los conjuntos a menos de 40 km podrán sumarse hasta la fecha de
            cierre. Con ese volumen el club negocia un precio por escalones, y
            cada conjunto lo decide con su consejo o su presidente.
          </p>
        ) : null}

        <div>
          <label className={modal.label} htmlFor="demand-category">
            Servicio
          </label>
          <select
            id="demand-category"
            className={modal.input}
            value={form.category}
            disabled={isEdit}
            onChange={(e) => {
              set("category", e.target.value as B2bDemandCategory);
              setForce(false);
            }}
          >
            <option value="">Selecciona el servicio</option>
            {B2B_DEMAND_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          {isEdit ? (
            <p className={`mt-1 ${modal.muted}`}>
              El servicio no se puede cambiar: los conjuntos que ya se sumaron lo
              hicieron por este.
            </p>
          ) : null}
        </div>

        {hasSimilar ? (
          <div className="rounded-xl border border-cyan-300 bg-cyan-50 p-3">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-cyan-900">
              <HiOutlineUserGroup size={16} />
              Ya hay{" "}
              {similar!.length === 1
                ? "una convocatoria"
                : `${similar!.length} convocatorias`}{" "}
              de {demandCategoryLabel(similar![0])} en tu zona
            </p>
            <p className="mt-0.5 text-xs text-cyan-800">
              Sumarte junta el volumen y baja el precio para todos. Publicar otra
              lo parte en dos.
            </p>
            <ul className="mt-2 space-y-1.5">
              {similar!.map((d) => (
                <li
                  key={d.id}
                  className="flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{d.title}</p>
                    <p className="text-xs text-slate-500">
                      {d.conjuntoName ?? "Otro conjunto"} · {d.city} ·{" "}
                      {d.totalConjuntos} conjuntos, {d.totalApartamentos} aptos
                      {d.joinDeadline ? ` · cierra el ${fmtDate(d.joinDeadline, true)}` : ""}
                    </p>
                  </div>
                  <Link
                    href={`/my-b2b/demands/${d.id}`}
                    onClick={onClose}
                    className="shrink-0 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-700"
                  >
                    Sumarme
                  </Link>
                </li>
              ))}
            </ul>
            <label className="mt-2 flex items-center gap-2 text-xs text-cyan-900">
              <input
                type="checkbox"
                className="accent-cyan-600"
                checked={force}
                onChange={(e) => setForce(e.target.checked)}
              />
              Ninguna me sirve: publicaré la mía de todas formas
            </label>
          </div>
        ) : null}

        {form.category === "otro" && !isEdit ? (
          <div>
            <label className={modal.label} htmlFor="demand-other">
              ¿Qué servicio necesitas?
            </label>
            <input
              id="demand-other"
              className={modal.input}
              maxLength={120}
              value={form.categoryOther}
              onChange={(e) => set("categoryOther", e.target.value)}
            />
          </div>
        ) : null}

        <div>
          <label className={modal.label} htmlFor="demand-title">
            Título
          </label>
          <input
            id="demand-title"
            className={modal.input}
            maxLength={140}
            placeholder="Ej: Pintura y arreglo de fachada de 3 torres"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div>
          <label className={modal.label} htmlFor="demand-description">
            Descripción
          </label>
          <textarea
            id="demand-description"
            rows={4}
            className={modal.input}
            placeholder="Qué hay que hacer, estado actual, metros aproximados, condiciones…"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
          <p
            className={`mt-1 text-xs ${
              missingDescription > 0 ? "text-amber-700" : "text-emerald-700"
            }`}
          >
            {missingDescription > 0
              ? `Faltan ${missingDescription} caracteres`
              : "Descripción suficiente"}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={modal.label} htmlFor="demand-close">
              Cierre de adhesiones
            </label>
            <input
              id="demand-close"
              type="date"
              className={modal.input}
              min={
                isEdit && demand?.joinDeadline
                  ? demand.joinDeadline.slice(0, 10)
                  : isoIn(DEMAND_JOIN_MIN_DAYS)
              }
              max={isoIn(DEMAND_JOIN_MAX_DAYS)}
              value={form.joinDeadline}
              disabled={isEdit && demand?.joinsOpen === false}
              onChange={(e) => set("joinDeadline", e.target.value)}
            />
            <p className={`mt-1 ${modal.muted}`}>
              {isEdit
                ? "Solo se puede extender."
                : "Al cerrar, el volumen queda fijo para negociar."}
            </p>
          </div>
          <div>
            <label className={modal.label} htmlFor="demand-start">
              Inicio deseado{" "}
              <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <input
              id="demand-start"
              type="date"
              className={modal.input}
              min={isoIn(0)}
              value={form.desiredStartDate}
              onChange={(e) => set("desiredStartDate", e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className={modal.label} htmlFor="demand-cost">
            ¿Cuánto paga hoy tu conjunto por este servicio, al mes?{" "}
            <span className="font-normal text-slate-400">(opcional)</span>
          </label>
          <input
            id="demand-cost"
            type="number"
            min={0}
            className={modal.input}
            placeholder="Ej: 3500000"
            value={form.currentMonthlyCost}
            onChange={(e) => set("currentMonthlyCost", e.target.value)}
          />
          <p className={`mt-1 ${modal.muted}`}>
            Sirve para mostrar cuánto ahorra el grupo. Si ya contratas este
            servicio por la plataforma, lo tomamos solo.
          </p>
        </div>

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button colVariant="default" size="sm" rounded="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colVariant="primary"
            size="sm"
            rounded="md"
            disabled={isSaving}
            onClick={handleSubmit}
          >
            {isSaving ? "Guardando…" : isEdit ? "Guardar" : "Publicar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

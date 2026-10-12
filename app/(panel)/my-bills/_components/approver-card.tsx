"use client";

import { useMemo, useState } from "react";
import { Button, SelectField, Text } from "complexes-next-components";
import { FaHistory, FaUserCheck } from "react-icons/fa";
import ApproverHistory from "./approver-history";
import Link from "next/link";
import { route } from "@/app/_domain/constants/routes";
import {
  useApproverCandidatesQuery,
  useDesignateApproverMutation,
  useExpenseApproverQuery,
} from "./use-expense-approver";
import { ExpenseOwner } from "../services/response/expenseApprovalResponse";

const NO_TOWER = "__sin_torre__";

const unitLabel = (owner: Pick<ExpenseOwner, "tower" | "apartment">) =>
  [
    owner.tower ? `Torre ${owner.tower}` : null,
    owner.apartment ? `Apto. ${owner.apartment}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

/**
 * Quién confirma los gastos que registra la administración.
 *
 * En Básico y Oro no hay módulo de consejo, así que la administración indica
 * la torre y el apartamento del presidente. En Platino, si el consejo ya tiene
 * presidente, aprueba él y aquí solo se muestra.
 */
export default function ApproverCard() {
  const { data: settings, isLoading } = useExpenseApproverQuery();
  const [editing, setEditing] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const locked = !!settings?.lockedByCouncil;
  const showPicker =
    !locked && (editing || (!isLoading && !settings?.approver));

  const { data: candidates = [], isLoading: loadingCandidates } =
    useApproverCandidatesQuery(showPicker);
  const mutation = useDesignateApproverMutation();

  const [tower, setTower] = useState("");
  const [apartment, setApartment] = useState("");
  const [userId, setUserId] = useState("");

  const towers = useMemo(
    () => [...new Set(candidates.map((c) => c.tower ?? NO_TOWER))],
    [candidates],
  );

  const apartments = useMemo(
    () => [
      ...new Set(
        candidates
          .filter((c) => (c.tower ?? NO_TOWER) === tower)
          .map((c) => c.apartment ?? ""),
      ),
    ],
    [candidates, tower],
  );

  const owners = useMemo(
    () =>
      candidates.filter(
        (c) =>
          (c.tower ?? NO_TOWER) === tower && (c.apartment ?? "") === apartment,
      ),
    [candidates, tower, apartment],
  );

  // Con un solo propietario en el apartamento no hace falta escogerlo.
  const selectedUserId = owners.length === 1 ? owners[0].userId : userId;

  const save = () => {
    if (!selectedUserId) return;
    mutation.mutate(selectedUserId, {
      onSuccess: () => {
        setEditing(false);
        setTower("");
        setApartment("");
        setUserId("");
      },
    });
  };

  if (isLoading || !settings) return null;

  return (
    <section className="mt-3 bg-white border border-gray-200 rounded-2xl shadow-sm p-4 space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <FaUserCheck className="text-cyan-700" size={18} />
          {/* Sin `colVariant="on"`: en el tema oscuro sale blanco sobre esta
              tarjeta blanca. */}
          <h3 className="text-sm font-bold text-gray-800">
            ¿Quién aprueba los gastos?
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {settings.pendingCount > 0 && (
            <span className="text-xs font-semibold rounded-full px-2.5 py-1 bg-amber-100 text-amber-800">
              {settings.pendingCount}{" "}
              {settings.pendingCount === 1
                ? "gasto espera confirmación"
                : "gastos esperan confirmación"}
            </span>
          )}
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            aria-expanded={showHistory}
            className="inline-flex items-center gap-1.5 rounded-full border border-cyan-600 px-3 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-50"
          >
            <FaHistory size={12} />
            {showHistory ? "Ocultar historial" : "Historial"}
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="rounded-xl border border-gray-200 p-3 space-y-2">
          <p className="text-xs text-gray-500">
            Quién ha aprobado los gastos del conjunto, en qué periodo y qué
            respondió cada uno.
          </p>
          <ApproverHistory audience="staff" />
        </div>
      )}

      {settings.approver && !editing && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gray-50 border border-gray-200 px-3 py-2">
          <div>
            <Text className="text-sm font-semibold text-gray-800">
              {settings.approver.name ?? "Propietario"}
              <span className="ml-2 text-xs font-medium text-cyan-700">
                {settings.source === "council"
                  ? "Presidente del consejo"
                  : "Designado por la administración"}
              </span>
            </Text>
            <Text className="text-xs text-gray-500">
              {unitLabel(settings.approver)}
            </Text>
          </div>

          {!locked && (
            <div className="flex gap-2">
              <Button
                size="sm"
                colVariant="primary"
                onClick={() => setEditing(true)}
              >
                Cambiar
              </Button>
              <Button
                size="sm"
                colVariant="danger"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(null)}
              >
                Quitar
              </Button>
            </div>
          )}
        </div>
      )}

      {locked && settings.approver && (
        <Text className="text-xs text-gray-500">
          Tu conjunto tiene consejo de administración: los gastos los confirma
          su presidente. Para cambiarlo, asigna otro presidente en el módulo de
          Consejo.
        </Text>
      )}

      {locked && !settings.approver && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 space-y-1">
          <p>
            Tu conjunto tiene consejo de administración, así que los gastos los
            confirma su presidente. El consejo todavía no tiene presidente.
          </p>
          <p>
            Elígelo en{" "}
            <Link href={route.mycouncil} className="font-semibold underline">
              Consejo
            </Link>
            . Los gastos que registres mientras tanto quedan esperando su
            confirmación.
          </p>
        </div>
      )}

      {!locked && settings.designated && !settings.designated.active && (
        <Text className="text-xs rounded-lg bg-amber-50 border border-amber-200 text-amber-800 px-3 py-2">
          {settings.designated.name ?? "El propietario designado"} ya no es
          propietario activo del conjunto. Designa a otra persona para que los
          gastos sigan llegando a alguien.
        </Text>
      )}

      {showPicker && (
        <div className="space-y-3">
          <Text className="text-xs text-gray-500">
            {settings.approver
              ? "Elige al nuevo propietario que confirmará los gastos."
              : "Indica la torre y el apartamento del presidente. Cada gasto que registres le llegará para que confirme o niegue que lo aprobó."}
          </Text>

          {loadingCandidates ? (
            <Text className="text-xs text-gray-400">
              Cargando propietarios…
            </Text>
          ) : candidates.length === 0 ? (
            <Text className="text-xs text-gray-500">
              No hay propietarios activos registrados en el conjunto.
            </Text>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <SelectField
                helpText="Torre"
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                defaultOption="— Torre —"
                options={towers.map((t) => ({
                  value: t,
                  label: t === NO_TOWER ? "Sin torre" : `Torre ${t}`,
                }))}
                value={tower}
                onChange={(e) => {
                  setTower(e.target.value);
                  setApartment("");
                  setUserId("");
                }}
              />
              <SelectField
                helpText="Apartamento"
                sizeHelp="xs"
                inputSize="sm"
                rounded="lg"
                defaultOption="— Apartamento —"
                disabled={!tower}
                options={apartments.map((a) => ({
                  value: a,
                  label: a ? `Apto. ${a}` : "Sin apartamento",
                }))}
                value={apartment}
                onChange={(e) => {
                  setApartment(e.target.value);
                  setUserId("");
                }}
              />
              {owners.length > 1 ? (
                <SelectField
                  helpText="Propietario"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="lg"
                  defaultOption="— Propietario —"
                  options={owners.map((o) => ({
                    value: o.userId,
                    label: o.name ?? "Sin nombre",
                  }))}
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              ) : (
                <div className="flex flex-col justify-center text-sm text-gray-700">
                  {owners[0] ? (
                    <>
                      <span className="text-xs text-gray-500">Propietario</span>
                      <span className="font-semibold">
                        {owners[0].name ?? "Sin nombre"}
                      </span>
                    </>
                  ) : null}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-2">
            {editing && (
              <Button
                size="sm"
                colVariant="warning"
                onClick={() => setEditing(false)}
              >
                Cancelar
              </Button>
            )}
            <Button
              size="sm"
              colVariant="success"
              disabled={!selectedUserId || mutation.isPending}
              onClick={save}
            >
              {mutation.isPending ? "Guardando…" : "Guardar aprobador"}
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

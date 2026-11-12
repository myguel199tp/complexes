"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import ModalAdminHistory from "@/app/(panel)/my-new-user/_components/staff/modal-admin-history";
import {
  AdminSuccessionInput,
  adminSuccessionService,
  CurrentAdmin,
} from "../services/adminSuccessionService";

const QUERY_KEY = "admin_governance";

type Form = Omit<AdminSuccessionInput, "retireRelationIds">;

const EMPTY: Form = {
  name: "",
  lastName: "",
  email: "",
  phone: "",
  indicative: "+57",
  numberId: "",
  reason: "",
};

const FIELDS: [keyof Form, string, string][] = [
  ["name", "Nombre", "text"],
  ["lastName", "Apellido", "text"],
  ["email", "Correo", "email"],
  ["phone", "Teléfono", "tel"],
  ["numberId", "Documento", "text"],
];

const card =
  "rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-slate-900";
const title = "text-base font-semibold text-gray-900 dark:text-slate-100";
const muted = "text-sm text-gray-500 dark:text-slate-400";
const input =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-white/15 dark:bg-slate-950 dark:text-slate-100";
const label = "mb-1 block text-xs font-medium text-gray-600 dark:text-slate-300";
const primaryBtn =
  "rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50";
const outlineBtn =
  "rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5";
const dangerBtn =
  "rounded-lg border border-red-300 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10";

/**
 * La administración del conjunto vista desde el consejo. El presidente hace
 * aquí el cambio: nombra a la nueva y retira a la anterior (Ley 675: al
 * administrador lo elige el consejo). El resto del consejo la consulta.
 */
export default function AdminSuccessionPanel() {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);

  const [form, setForm] = useState<Form>(EMPTY);
  const [retireIds, setRetireIds] = useState<string[] | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: [QUERY_KEY, conjuntoId],
    queryFn: () => adminSuccessionService.governance(conjuntoId),
    enabled: !!conjuntoId,
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [QUERY_KEY, conjuntoId] });
    queryClient.invalidateQueries({ queryKey: ["admin_periods"] });
    queryClient.invalidateQueries({ queryKey: ["conjunto_audit"] });
  };

  const change = useMutation({
    mutationFn: (payload: AdminSuccessionInput) =>
      adminSuccessionService.change(conjuntoId, payload),
    onSuccess: () => {
      setForm(EMPTY);
      setRetireIds(null);
      refresh();
      showAlert(
        "Administración cambiada. Si la persona no tenía cuenta, le llegó un correo para activarla.",
        "success",
      );
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const resign = useMutation({
    mutationFn: () => adminSuccessionService.resignPresidency(conjuntoId),
    onSuccess: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: ["council_status"] });
      queryClient.invalidateQueries({ queryKey: ["council_members"] });
      showAlert(
        "Dejaste la presidencia. El consejo elegirá al nuevo presidente en la próxima reunión.",
        "success",
      );
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  if (isLoading) return <p className={muted}>Cargando…</p>;

  if (error || !data) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400">
        {error instanceof Error
          ? error.message
          : "No se pudo cargar la administración."}
      </p>
    );
  }

  // Por defecto salen todas las administraciones actuales.
  const selected = retireIds ?? data.current.map((a) => a.relationId);
  const toggle = (relationId: string) =>
    setRetireIds(
      selected.includes(relationId)
        ? selected.filter((id) => id !== relationId)
        : [...selected, relationId],
    );

  const submit = () => {
    const missing = FIELDS.some(([key]) => !String(form[key] ?? "").trim());
    if (missing || !form.reason.trim()) {
      showAlert("Completa los datos de la nueva administración y el motivo.", "error");
      return;
    }
    change.mutate({ ...form, retireRelationIds: selected });
  };

  return (
    <div className="space-y-5">
      <div className={card}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className={title}>Administración del conjunto</h2>
            <p className={muted}>
              {data.hasPresident
                ? `El cambio de administración lo hace el presidente del consejo${
                    data.presidentName ? ` (${data.presidentName})` : ""
                  }.`
                : "El consejo no tiene presidente: mientras tanto la administración sigue sus reglas de siempre."}
            </p>
          </div>
          <button
            type="button"
            className={outlineBtn}
            onClick={() => setHistoryOpen(true)}
          >
            Ver historial y bitácora
          </button>
        </div>

        <ul className="mt-4 space-y-2">
          {data.current.length === 0 && (
            <li className="text-sm text-red-600 dark:text-red-400">
              El conjunto no tiene administración.
            </li>
          )}
          {data.current.map((admin) => (
            <AdminRow
              key={admin.relationId}
              admin={admin}
              canRetire={data.isPresident && data.current.length > 1}
              conjuntoId={conjuntoId}
              onDone={refresh}
            />
          ))}
        </ul>
      </div>

      {data.isPresident && (
        <div className={card}>
          <h2 className={title}>Cambiar administración</h2>
          <p className={`${muted} mt-1`}>
            Se nombra a la nueva y después se retira a las que marques: el
            conjunto no queda sin nadie. Cada una responde por lo que autorizó
            en su periodo.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FIELDS.map(([key, text, type]) => (
              <label key={key}>
                <span className={label}>{text}</span>
                <input
                  type={type}
                  className={input}
                  value={form[key] ?? ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </label>
            ))}
          </div>

          {data.current.length > 0 && (
            <fieldset className="mt-4">
              <legend className={label}>Sale de la administración</legend>
              <div className="space-y-1">
                {data.current.map((admin) => (
                  <label
                    key={admin.relationId}
                    className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(admin.relationId)}
                      onChange={() => toggle(admin.relationId)}
                    />
                    {admin.name}
                    {admin.email ? (
                      <span className={muted}>· {admin.email}</span>
                    ) : null}
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          <label className="mt-4 block">
            <span className={label}>
              Motivo (queda en la bitácora; ej.: acta del consejo del 10 de
              noviembre)
            </span>
            <textarea
              rows={2}
              maxLength={300}
              className={input}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </label>

          <div className="mt-4">
            <button
              type="button"
              className={primaryBtn}
              disabled={change.isPending}
              onClick={submit}
            >
              {change.isPending ? "Cambiando…" : "Cambiar administración"}
            </button>
          </div>
        </div>
      )}

      {data.isPresident && (
        <div className={card}>
          <h2 className={title}>Tu cargo</h2>
          <p className={`${muted} mt-1`}>
            Si dejas la presidencia sigues en el consejo, y la próxima reunión
            arranca con la elección del nuevo presidente.
          </p>
          <button
            type="button"
            className={`${dangerBtn} mt-3`}
            disabled={resign.isPending}
            onClick={() => {
              if (window.confirm("¿Dejar la presidencia del consejo?")) {
                resign.mutate();
              }
            }}
          >
            Dejar la presidencia
          </button>
        </div>
      )}

      <ModalAdminHistory
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
      />
    </div>
  );
}

function AdminRow({
  admin,
  canRetire,
  conjuntoId,
  onDone,
}: {
  admin: CurrentAdmin;
  canRetire: boolean;
  conjuntoId: string;
  onDone: () => void;
}) {
  const showAlert = useAlertStore((state) => state.showAlert);
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const retire = useMutation({
    mutationFn: () =>
      adminSuccessionService.retire(conjuntoId, admin.relationId, reason),
    onSuccess: () => {
      setOpen(false);
      setReason("");
      onDone();
      showAlert(`${admin.name} salió de la administración.`, "success");
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  return (
    <li className="rounded-lg border border-gray-200 p-3 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
            {admin.name}
          </p>
          {admin.email && <p className={muted}>{admin.email}</p>}
        </div>
        {canRetire && !open && (
          <button
            type="button"
            className={dangerBtn}
            onClick={() => setOpen(true)}
          >
            Retirar
          </button>
        )}
      </div>

      {open && (
        <div className="mt-3 space-y-2">
          <textarea
            rows={2}
            maxLength={300}
            className={input}
            placeholder="Motivo del retiro (queda en el historial)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              type="button"
              className={dangerBtn}
              disabled={!reason.trim() || retire.isPending}
              onClick={() => retire.mutate()}
            >
              {retire.isPending ? "Retirando…" : "Confirmar retiro"}
            </button>
            <button
              type="button"
              className={outlineBtn}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Modal } from "complexes-next-components";
import {
  HiOutlineScale,
  HiOutlineUserCircle,
  HiOutlineUsers,
} from "react-icons/hi2";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import {
  createApproval,
  getApprovalSetup,
} from "../services/b2bApprovalService";
import { fmtDate, modal } from "./b2b-ui";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Lo que se va a llevar, para que el administrador vea qué está enviando. */
  proposals: { key: string; label: string }[];
  quoteIds?: string[];
  planIds?: string[];
  /** Propuestas de renovación de proveedores actuales. */
  renewalIds?: string[];
  defaultTitle?: string;
  onCreated?: () => void;
}

/**
 * Lleva una contratación a decisión del conjunto.
 *
 * Antes de armarla pregunta quién decide y si hoy se puede: sin consejo
 * conformado, sin reunión programada o sin aprobador designado, explica qué
 * falta en vez de dejar enviar algo que nadie va a poder decidir.
 *
 * El modal de la librería es blanco en los dos temas: aquí todo usa `modal.*`.
 */
export function ApprovalFormModal({
  isOpen,
  onClose,
  proposals,
  quoteIds,
  planIds,
  renewalIds,
  defaultTitle = "",
  onCreated,
}: Props) {
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const showAlert = useAlertStore((s) => s.showAlert);
  const queryClient = useQueryClient();

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState("");
  const [meetingId, setMeetingId] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setTitle(defaultTitle);
    setDescription("");
    setMeetingId("");
    setError(null);
  }, [isOpen, defaultTitle]);

  const { data: setup, isLoading } = useQuery({
    queryKey: ["my_b2b_approval_setup", conjuntoId],
    queryFn: () => getApprovalSetup(conjuntoId),
    enabled: isOpen && !!conjuntoId,
  });

  const isCouncil = setup?.channel === "council";
  const meetings = useMemo(() => setup?.council?.meetings ?? [], [setup]);

  // Con una sola reunión abierta no hay nada que elegir.
  useEffect(() => {
    if (isCouncil && meetings.length === 1) setMeetingId(meetings[0].id);
  }, [isCouncil, meetings]);

  const createMut = useMutation({
    mutationFn: () =>
      createApproval(conjuntoId, {
        title: title.trim(),
        description: description.trim() || undefined,
        quoteIds,
        planIds,
        renewalIds,
        councilMeetingId: isCouncil ? meetingId : undefined,
      }),
    onSuccess: () => {
      showAlert(
        isCouncil
          ? "Quedó en el orden del día del consejo. Se contrata la propuesta que gane la votación."
          : "Se la enviamos al presidente. Te avisamos cuando decida.",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["my_b2b_approvals"] });
      queryClient.invalidateQueries({ queryKey: ["my_b2b_quotes"] });
      queryClient.invalidateQueries({ queryKey: ["my_b2b_contracts"] });
      onCreated?.();
      onClose();
    },
    onError: (e: Error) => showAlert(e.message, "error"),
  });

  const handleSubmit = () => {
    if (title.trim().length < 3) {
      return setError("Escribe qué se va a contratar.");
    }
    if (isCouncil && !meetingId) {
      return setError("Elige la reunión del consejo en la que se votará.");
    }
    setError(null);
    createMut.mutate();
  };

  const approver = setup?.approver;
  const approverPlace = [
    approver?.tower ? `Torre ${approver.tower}` : null,
    approver?.apartment ? `Apto ${approver.apartment}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Modal
      className="w-11/12 max-w-xl max-h-[90vh] overflow-y-auto"
      isOpen={isOpen}
      onClose={onClose}
      title="Llevar a decisión"
    >
      <div className="space-y-5">
        <p className={modal.text}>
          La administración ejecuta lo que autoriza el conjunto. Si se elige
          una propuesta, queda la alianza pendiente de que el proveedor la
          confirme.
        </p>

        {/* Quién decide */}
        {isLoading ? (
          <div className="h-16 animate-pulse rounded-xl bg-slate-100" />
        ) : setup ? (
          <div className="flex items-start gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white">
              {isCouncil ? <HiOutlineUsers size={20} /> : <HiOutlineUserCircle size={22} />}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">
                Decide
              </p>
              {isCouncil ? (
                <p className="text-sm text-slate-800">
                  <strong>El consejo de administración</strong>
                  {setup.council ? ` · ${setup.council.members} miembros` : ""}. Se
                  vota en una reunión: gana la propuesta con más votos.
                </p>
              ) : (
                <p className="text-sm text-slate-800">
                  <strong>{approver?.name ?? "El presidente designado"}</strong>
                  {approverPlace ? ` · ${approverPlace}` : ""}. Es quien aprueba los
                  gastos del conjunto.
                </p>
              )}
            </div>
          </div>
        ) : null}

        {setup && !setup.ready ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-3">
            <p className="text-sm font-semibold text-amber-900">
              Falta un paso antes de llevarla
            </p>
            <p className="mt-0.5 text-sm text-amber-800">{setup.blocker}</p>
            <Link
              href={isCouncil ? "/my-council" : "/my-bills/expenses"}
              className="mt-2 inline-block text-sm font-semibold text-cyan-700 hover:underline"
            >
              {isCouncil ? "Ir a Consejo →" : "Designar quién aprueba →"}
            </Link>
          </div>
        ) : null}

        {/* Qué se compara */}
        <div>
          <p className={modal.label}>
            {proposals.length === 1
              ? "Propuesta"
              : `${proposals.length} propuestas que se comparan`}
          </p>
          <ol className="space-y-1.5">
            {proposals.map((p, i) => (
              <li
                key={p.key}
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
              >
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                  {i + 1}
                </span>
                <span className="min-w-0">{p.label}</span>
              </li>
            ))}
          </ol>
          {proposals.length === 1 ? (
            <p className={`mt-1.5 ${modal.muted}`}>
              Lo usual es comparar al menos tres. Puedes marcar varias desde
              «Cotizaciones».
            </p>
          ) : null}
        </div>

        {setup?.ready ? (
          <>
            {isCouncil ? (
              <div>
                <p className={modal.label}>¿En qué reunión se vota?</p>
                <div className="grid gap-2">
                  {meetings.map((m) => (
                    <label
                      key={m.id}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm transition ${
                        meetingId === m.id
                          ? "border-cyan-500 bg-cyan-50 ring-2 ring-cyan-500/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="meeting"
                          className="accent-cyan-600"
                          checked={meetingId === m.id}
                          onChange={() => setMeetingId(m.id)}
                        />
                        <span className="text-slate-800">{m.title}</span>
                      </span>
                      <span className="shrink-0 text-xs text-slate-500">
                        {m.status === "ongoing" ? (
                          <span className="font-semibold text-emerald-700">En curso</span>
                        ) : (
                          fmtDate(m.date, true)
                        )}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            ) : null}

            <div>
              <label className={modal.label} htmlFor="approval-title">
                ¿Qué se va a contratar?
              </label>
              <input
                id="approval-title"
                className={modal.input}
                placeholder="Ej: Aseo de zonas comunes 2027"
                maxLength={140}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label className={modal.label} htmlFor="approval-context">
                Contexto para quien decide{" "}
                <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <textarea
                id="approval-context"
                rows={3}
                className={modal.input}
                placeholder="Por qué se necesita, qué se comparó, qué recomienda la administración…"
                maxLength={2000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className={modal.box}>
              <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                <HiOutlineScale size={15} /> Qué pasa después
              </p>
              <ol className="list-decimal space-y-0.5 pl-5 text-xs text-slate-600">
                {isCouncil ? (
                  <>
                    <li>La votación queda en la reunión y sale en el acta.</li>
                    <li>Al finalizar la reunión gana la propuesta con más votos; con empate no hay decisión.</li>
                  </>
                ) : (
                  <>
                    <li>Al presidente le llega un aviso con el cuadro comparativo.</li>
                    <li>Elige una propuesta o dice que ninguna, con su motivo.</li>
                  </>
                )}
                <li>Si se elige una, el proveedor confirma la alianza y arranca el servicio.</li>
              </ol>
            </div>
          </>
        ) : null}

        {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button size="sm" rounded="md" colVariant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            rounded="md"
            colVariant="success"
            disabled={!setup?.ready || createMut.isLoading}
            onClick={handleSubmit}
          >
            {createMut.isLoading ? "Enviando…" : "Llevar a decisión"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

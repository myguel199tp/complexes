"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Title, Text } from "complexes-next-components";
import ComercioModal from "../_components/comercio-modal";
import { useComercioGuard } from "../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { Button, TextAreaField } from "@/app/components/ui/form";
import {
  CLAIM_CAUSE_LABELS,
  CLAIM_REJECT_REASON_MIN,
  CLAIM_STATUS_LABELS,
  CLAIM_STATUS_TONE,
  ClaimCause,
  ClaimStatus,
  ComercioClaim,
  claimPhotoUrl,
  getClaimSummary,
  getClaims,
  refundClaim,
  rejectClaim,
  replaceClaim,
} from "./services/comercioClaimService";

type Tab = "open" | "active" | "closed" | "all";

const TABS: { value: Tab; label: string; statuses: ClaimStatus[] | null }[] = [
  { value: "open", label: "Por responder", statuses: ["open"] },
  {
    value: "active",
    label: "En curso",
    statuses: ["replacement_in_progress", "refund_reported"],
  },
  {
    value: "closed",
    label: "Cerrados",
    statuses: ["resolved", "rejected", "unanswered", "no_agreement", "withdrawn"],
  },
  { value: "all", label: "Todos", statuses: null },
];

const money = (value: number | string | null | undefined) =>
  `$${Number(value ?? 0).toLocaleString("es-CO")}`;

const when = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("es-CO", {
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "";

/** "Quedan 5 h", en rojo cuando falta poco. */
function deadlineLabel(respondBy: string) {
  const hours = (new Date(respondBy).getTime() - Date.now()) / 3600_000;
  if (hours <= 0) return { text: "Venció el plazo", urgent: true };
  if (hours < 1) return { text: "Queda menos de 1 h", urgent: true };
  return { text: `Quedan ${Math.floor(hours)} h`, urgent: hours < 12 };
}

const HISTORY_LABEL: Record<string, string> = {
  opened: "El cliente reclamó",
  reminder: "Recordatorio enviado",
  replacement: "Enviaste reposición",
  refund: "Registraste devolución",
  rejected: "Rechazaste el reclamo",
  unanswered: "Se cerró sin respuesta",
  refund_confirmed: "El cliente confirmó la devolución",
  refund_disputed: "El cliente dice que no le llegó",
  withdrawn: "El cliente lo retiró",
  replacement_delivered: "La reposición se entregó",
  replacement_cancelled: "La reposición se canceló",
};

type Action = { kind: "replace" | "refund" | "reject"; claim: ComercioClaim };

export default function ComercioClaimsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  useComercioGuard(() => router.push("/comercio/login"));

  const [tab, setTab] = useState<Tab>("open");
  const [action, setAction] = useState<Action | null>(null);
  const [cause, setCause] = useState<ClaimCause | "">("");
  const [message, setMessage] = useState("");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");

  const claimsQuery = useQuery({
    queryKey: ["comercio-claims"],
    queryFn: getClaims,
    refetchInterval: 60_000,
  });
  const summaryQuery = useQuery({
    queryKey: ["comercio-claims-summary"],
    queryFn: getClaimSummary,
  });

  const close = () => {
    setAction(null);
    setCause("");
    setMessage("");
    setAmount("");
    setReference("");
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["comercio-claims"] });
    queryClient.invalidateQueries({ queryKey: ["comercio-claims-summary"] });
    queryClient.invalidateQueries({ queryKey: ["comercio-orders"] });
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!action) return;
      const { kind, claim } = action;
      if (kind === "replace") {
        return replaceClaim(claim.id, {
          cause: cause as ClaimCause,
          message: message.trim() || undefined,
        });
      }
      if (kind === "refund") {
        return refundClaim(claim.id, {
          cause: cause as ClaimCause,
          amount: Number(amount),
          reference: reference.trim() || undefined,
          message: message.trim() || undefined,
        });
      }
      return rejectClaim(claim.id, message.trim());
    },
    onSuccess: () => {
      showAlert(
        action?.kind === "replace"
          ? "Listo. La reposición quedó en Pedidos como confirmada: asígnale repartidor."
          : action?.kind === "refund"
            ? "Devolución registrada. El cliente la confirma cuando la vea."
            : "Reclamo rechazado. Le avisamos al cliente.",
        "success",
      );
      refresh();
      close();
    },
    onError: (error: Error) => showAlert(error.message, "error"),
  });

  const claims = claimsQuery.data ?? [];
  const statuses = TABS.find((t) => t.value === tab)?.statuses;
  const visible = statuses
    ? claims.filter((claim) => statuses.includes(claim.status))
    : claims;
  const summary = summaryQuery.data;

  const ready =
    action?.kind === "reject"
      ? message.trim().length >= CLAIM_REJECT_REASON_MIN
      : !!cause &&
        (action?.kind !== "refund" ||
          (Number(amount) > 0 &&
            Number(amount) <= Number(action.claim.order?.totalAmount ?? 0)));

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <Title as="h1" size="xs" colVariant="on" font="semi">
            Reclamos
          </Title>
          <Text size="sm" className="text-slate-400 mt-1">
            Lo que tus clientes reportan que llegó dañado, en mal estado,
            incompleto o equivocado. Tienes {summary?.responseHours ?? 48} horas
            para reponer, devolver o rechazar con un motivo; si no respondes, el
            reclamo se cierra sin respuesta y al cliente se le orienta a la
            Superintendencia de Industria y Comercio.
          </Text>
        </div>

        {summary && summary.transportByDelivery.length > 0 ? (
          <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-4">
            <div className="text-sm font-semibold text-slate-200">
              Reclamos por transporte, por repartidor
            </div>
            <Text size="xs" className="text-slate-400 mt-1">
              Los que marcaste como dañados en el camino. Solo los ves tú: el
              repartidor no ve los reclamos.
            </Text>
            <div className="mt-3 flex flex-wrap gap-2">
              {summary.transportByDelivery.map((row) => (
                <span
                  key={row.deliveryId}
                  className="rounded-2xl bg-white/10 px-3 py-1.5 text-xs text-slate-200"
                >
                  {row.fullName} · <strong>{row.count}</strong>
                  <span className="text-slate-400"> · último {when(row.lastAt)}</span>
                </span>
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex gap-2 mb-4 flex-wrap">
          {TABS.map((t) => (
            <Button
              key={t.value}
              size="sm"
              rounded="md"
              colVariant={tab === t.value ? "primary" : "default"}
              onClick={() => setTab(t.value)}
            >
              {t.label}
              {t.value === "open" && summary?.open ? ` (${summary.open})` : ""}
            </Button>
          ))}
        </div>

        {claimsQuery.isLoading ? (
          <Text size="sm" className="text-slate-400">
            Cargando reclamos...
          </Text>
        ) : visible.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
            <Text size="sm" className="text-slate-400">
              {tab === "open"
                ? "No tienes reclamos por responder."
                : "No hay reclamos aquí."}
            </Text>
          </div>
        ) : (
          <div className="space-y-3">
            {visible.map((claim) => (
              <ClaimRow
                key={claim.id}
                claim={claim}
                onAction={(kind) => {
                  setAction({ kind, claim });
                  if (kind === "refund") setAmount(String(claim.claimedAmount));
                }}
              />
            ))}
          </div>
        )}
      </div>

      <ComercioModal
        className="w-11/12 max-w-md max-h-[88vh] overflow-y-auto"
        isOpen={!!action}
        onClose={close}
        title={
          action?.kind === "replace"
            ? "Reponer"
            : action?.kind === "refund"
              ? "Devolver el dinero"
              : "Rechazar el reclamo"
        }
      >
        <div className="space-y-4 p-2 text-gray-800">
          {action?.kind === "replace" ? (
            <Text size="sm" className="text-gray-600">
              Se crea un pedido nuevo en $0, ya confirmado, con{" "}
              {action.claim.items
                .map((item) => `${item.quantity}× ${item.name}`)
                .join(", ")}
              . Descuenta del inventario. Asígnale repartidor desde Pedidos y
              sale con su código y su pase de portería, como cualquier pedido.
              Cuando se entregue, el reclamo queda resuelto.
            </Text>
          ) : null}

          {action?.kind === "refund" ? (
            <Text size="sm" className="text-gray-600">
              La plataforma no mueve el dinero: devuélvelo tú (efectivo, Nequi,
              transferencia) y regístralo aquí. El cliente confirma cuando lo
              vea. Lo reclamado vale {money(action.claim.claimedAmount)}; el
              pedido fue por {money(action.claim.order?.totalAmount)}.
            </Text>
          ) : null}

          {action?.kind === "reject" ? (
            <Text size="sm" className="text-gray-600">
              El cliente lee el motivo y el reclamo se cierra. Se le indica que
              puede acudir a la Superintendencia de Industria y Comercio.
            </Text>
          ) : null}

          {action && action.kind !== "reject" ? (
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2">
                ¿Qué falló?
              </div>
              <div className="space-y-2">
                {(Object.keys(CLAIM_CAUSE_LABELS) as ClaimCause[]).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCause(key)}
                    className={`w-full rounded-xl border px-3 py-2 text-left text-sm transition ${
                      cause === key
                        ? "border-cyan-600 bg-cyan-50 font-semibold text-cyan-900"
                        : "border-gray-200 hover:border-cyan-300"
                    }`}
                  >
                    {CLAIM_CAUSE_LABELS[key]}
                  </button>
                ))}
              </div>
              <Text size="xs" className="text-gray-500 mt-1">
                Si fue el transporte, cuenta en el resumen de ese repartidor.
                Solo lo ves tú.
              </Text>
            </div>
          ) : null}

          {action?.kind === "refund" ? (
            <>
              <div>
                <label className="text-xs text-gray-500">Monto devuelto</label>
                <input
                  className="ui-native w-full"
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">
                  Cómo lo devolviste (opcional)
                </label>
                <input
                  className="ui-native w-full"
                  placeholder="Ej: Nequi 300 123 4567, ref. 88123"
                  maxLength={200}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
            </>
          ) : null}

          <TextAreaField
            placeholder={
              action?.kind === "reject"
                ? `Por qué lo rechazas (mínimo ${CLAIM_REJECT_REASON_MIN} caracteres)`
                : "Mensaje para el cliente (opcional)"
            }
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full"
          />

          <Button
            colVariant={action?.kind === "reject" ? "danger" : "success"}
            size="full"
            rounded="md"
            disabled={!ready || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending
              ? "Enviando..."
              : action?.kind === "replace"
                ? "Crear la reposición"
                : action?.kind === "refund"
                  ? "Registrar la devolución"
                  : "Rechazar"}
          </Button>
        </div>
      </ComercioModal>
    </div>
  );
}

function ClaimRow({
  claim,
  onAction,
}: {
  claim: ComercioClaim;
  onAction: (kind: Action["kind"]) => void;
}) {
  const deadline = claim.status === "open" ? deadlineLabel(claim.respondBy) : null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-100">
            {claim.reasonLabel}
          </div>
          <div className="text-xs text-slate-400 mt-0.5">
            Pedido #{claim.orderId.slice(0, 8).toUpperCase()} ·{" "}
            {claim.buyerName ?? "Cliente"}
            {claim.order?.contactPhone ? ` · ${claim.order.contactPhone}` : ""}
            {claim.branch ? ` · ${claim.branch.name}` : ""}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            Reclamó el {when(claim.createdAt)}
            {claim.delivery ? ` · Lo entregó ${claim.delivery.fullName}` : ""}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${CLAIM_STATUS_TONE[claim.status]}`}
          >
            {CLAIM_STATUS_LABELS[claim.status]}
          </span>
          {deadline ? (
            <span
              className={`text-[11px] font-semibold ${
                deadline.urgent ? "text-red-300" : "text-amber-300"
              }`}
            >
              {deadline.text}
            </span>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-200">“{claim.description}”</p>

      <div className="mt-2 text-xs text-slate-300">
        {claim.items.map((item) => `${item.quantity}× ${item.name}`).join(", ")}
        {" · "}
        <span className="text-slate-400">Vale {money(claim.claimedAmount)}</span>
        {" · "}
        <span className="text-slate-400">
          Pide{" "}
          {claim.requestedResolution === "replacement"
            ? "reposición"
            : "devolución del dinero"}
        </span>
      </div>

      {claim.photosCount > 0 ? (
        <div className="mt-3 flex gap-2">
          {Array.from({ length: claim.photosCount }, (_, index) => (
            <a
              key={index}
              href={claimPhotoUrl(claim.id, index)}
              target="_blank"
              rel="noreferrer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={claimPhotoUrl(claim.id, index)}
                alt={`Foto ${index + 1} del reclamo`}
                className="h-20 w-20 rounded-xl object-cover border border-white/10"
              />
            </a>
          ))}
        </div>
      ) : null}

      {claim.comercioResponse ? (
        <p className="mt-3 text-xs text-slate-300">
          <span className="text-slate-500">Tu respuesta:</span>{" "}
          {claim.comercioResponse}
        </p>
      ) : null}
      {claim.cause ? (
        <p className="mt-1 text-xs text-slate-400">
          Causa: {CLAIM_CAUSE_LABELS[claim.cause]}
        </p>
      ) : null}
      {claim.refundAmount !== null && claim.refundAmount !== undefined ? (
        <p className="mt-1 text-xs text-slate-300">
          Devolución: {money(claim.refundAmount)}
          {claim.refundReference ? ` · ${claim.refundReference}` : ""}
        </p>
      ) : null}
      {claim.buyerNote ? (
        <p className="mt-1 text-xs text-slate-300">
          <span className="text-slate-500">El cliente:</span> {claim.buyerNote}
        </p>
      ) : null}
      {claim.status === "replacement_in_progress" ? (
        <p className="mt-2 text-xs text-emerald-300">
          La reposición está en Pedidos como confirmada, en $0. Asígnale
          repartidor si aún no lo tiene.
        </p>
      ) : null}

      {claim.history.length > 1 ? (
        <details className="mt-3">
          <summary className="cursor-pointer text-xs text-slate-400">
            Historial
          </summary>
          <ul className="mt-2 space-y-1">
            {claim.history.map((entry, index) => (
              <li key={index} className="text-xs text-slate-400">
                {when(entry.at)} · {HISTORY_LABEL[entry.type] ?? entry.type}
                {entry.note ? ` — ${entry.note}` : ""}
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {claim.status === "open" ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            size="sm"
            rounded="md"
            colVariant="success"
            onClick={() => onAction("replace")}
          >
            Reponer
          </Button>
          <Button
            size="sm"
            rounded="md"
            colVariant="primary"
            onClick={() => onAction("refund")}
          >
            Devolver el dinero
          </Button>
          <Button
            size="sm"
            rounded="md"
            colVariant="danger"
            variant="soft"
            onClick={() => onAction("reject")}
          >
            Rechazar
          </Button>
        </div>
      ) : null}
    </div>
  );
}

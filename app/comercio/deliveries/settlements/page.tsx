"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Text, Title } from "complexes-next-components";
import ComercioModal from "../../_components/comercio-modal";
import { useComercioGuard } from "../../_lib/comercio-auth";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { Button } from "@/app/components/ui/form";
import {
  ComercioSettlementRow,
  VEHICLE_LABELS,
  fmtMoney,
  getSettlement,
  getSettlements,
  recordCashReceived,
  recordPayout,
  voidSettlementEntry,
} from "../services/comercioDeliveryService";
import {
  ENTRY_STATUS_LABELS,
  PAYOUT_METHOD_LABELS,
  SettlementEntry,
  SettlementPayoutMethod,
  cashOwedText,
  dayLabel,
  payOwedText,
  shiftDay,
} from "@/app/delivery/services/deliverySettlementTypes";

const inputCls =
  "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800";

type Action =
  | { kind: "cash"; row: ComercioSettlementRow }
  | { kind: "payout"; row: ComercioSettlementRow };

/**
 * Corte diario con los repartidores.
 *
 * La plataforma no le paga al repartidor ni recibe el efectivo de la puerta:
 * eso pasa entre el comercio y él. Aquí el dueño ve, por cada repartidor,
 * cuánto efectivo cobró y le falta entregar, cuánto le debe por sus entregas,
 * y registra lo que recibió y lo que pagó. Los pagos cuentan cuando el
 * repartidor confirma que le llegaron.
 */
export default function ComercioSettlementsPage() {
  const router = useRouter();
  useComercioGuard(() => router.push("/comercio/login"));

  const [day, setDay] = useState<string | undefined>(undefined);
  const [openId, setOpenId] = useState<string | null>(null);
  const [action, setAction] = useState<Action | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["comercio-settlements", day ?? "today"],
    queryFn: () => getSettlements(day),
    refetchInterval: 60_000,
  });

  const today = data?.today ?? day;
  const current = data?.day ?? day;
  const isToday = !!current && current === today;

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
          <Title as="h1" size="xs" colVariant="on" font="semi">
            Corte de repartidores
          </Title>
          <Link
            href="/comercio/deliveries"
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            ← Repartidores
          </Link>
        </div>
        <Text size="xs" className="text-slate-400">
          El efectivo que cobran en la puerta es tuyo, y a ellos les pagas tú,
          por fuera de la plataforma. Aquí registras lo que recibiste y lo que
          pagaste; el repartidor ve lo mismo y confirma los pagos.
        </Text>

        {current && today ? (
          <div className="mt-4 flex max-w-md items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-2">
            <button
              type="button"
              onClick={() => {
                setOpenId(null);
                setDay(shiftDay(current, -1));
              }}
              className="rounded-xl px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10"
            >
              ← Anterior
            </button>
            <span className="text-sm font-semibold capitalize text-slate-100">
              {dayLabel(current, today)}
            </span>
            <button
              type="button"
              disabled={current >= today}
              onClick={() => {
                setOpenId(null);
                setDay(shiftDay(current, 1));
              }}
              className="rounded-xl px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-30"
            >
              Siguiente →
            </button>
          </div>
        ) : null}

        {isLoading ? (
          <Text size="sm" className="mt-4 text-slate-400">
            Cargando...
          </Text>
        ) : error ? (
          <Text size="sm" colVariant="danger" className="mt-4">
            {(error as Error).message}
          </Text>
        ) : data ? (
          <>
            <div className="mt-4 grid max-w-md grid-cols-2 gap-3">
              <Big
                label="Efectivo por recibir"
                value={fmtMoney(Math.max(0, data.totals.cashOwed))}
                tone="text-amber-300"
              />
              <Big
                label="Debes a repartidores"
                value={fmtMoney(Math.max(0, data.totals.payOwed))}
                tone="text-emerald-300"
              />
            </div>

            {!isToday ? (
              <Text size="xs" className="mt-3 text-slate-500">
                Estás viendo un día pasado. Lo que registres va en el corte de
                hoy: vuelve a hoy para registrar.
              </Text>
            ) : null}

            {data.rows.length === 0 ? (
              <Text size="sm" className="mt-6 text-slate-400">
                No tienes repartidores todavía.
              </Text>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {data.rows.map((row) => (
                  <DeliveryCard
                    key={row.deliveryId}
                    row={row}
                    day={data.day}
                    canRecord={isToday}
                    open={openId === row.deliveryId}
                    onToggle={() =>
                      setOpenId(openId === row.deliveryId ? null : row.deliveryId)
                    }
                    onAction={setAction}
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>

      <RecordModal action={action} onClose={() => setAction(null)} />
    </div>
  );
}

function DeliveryCard({
  row,
  day,
  canRecord,
  open,
  onToggle,
  onAction,
}: {
  row: ComercioSettlementRow;
  day: string;
  canRecord: boolean;
  open: boolean;
  onToggle: () => void;
  onAction: (action: Action) => void;
}) {
  const f = row.dayFigures;
  const paid = f.paidFromCash + f.paidOther;

  return (
    <div className={`rounded-2xl border border-white/10 bg-white/[0.04] p-4 ${open ? "md:col-span-2" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <Text size="sm" font="semi" className="text-slate-100">
            {row.fullName ?? "Repartidor"}
          </Text>
          <Text size="xs" className="text-slate-500">
            {row.vehicleType ? VEHICLE_LABELS[row.vehicleType] : "Sin vehículo"}
            {!row.linkActive ? " · ya no trabaja contigo" : ""}
          </Text>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 rounded-lg px-2 py-1 text-xs text-cyan-300 hover:bg-white/10"
        >
          {open ? "Cerrar" : "Ver detalle"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <Mini label="Entregas" value={String(f.delivered)} />
        <Mini label="Ganó" value={fmtMoney(f.earned)} />
        <Mini label="Cobró" value={fmtMoney(f.cashCollected)} />
        <Mini
          label="Recibiste / pagaste"
          value={`${fmtMoney(f.cashReceived)} / ${fmtMoney(paid)}`}
        />
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p className={row.closing.cashOwed > 0.01 ? "text-amber-300" : "text-slate-300"}>
          {cashOwedText(row.closing.cashOwed, "comercio", fmtMoney)}
        </p>
        <p className={row.closing.payOwed > 0.01 ? "text-emerald-300" : "text-slate-300"}>
          {payOwedText(row.closing.payOwed, "comercio", fmtMoney)}
        </p>
        {row.pendingPayouts.count > 0 ? (
          <p className="text-xs text-amber-200">
            {row.pendingPayouts.count} pago
            {row.pendingPayouts.count === 1 ? "" : "s"} esperando que lo
            confirme ({fmtMoney(row.pendingPayouts.amount)})
          </p>
        ) : null}
        {f.unpriced > 0 ? (
          <p className="text-xs text-slate-500">
            {f.unpriced} entrega{f.unpriced === 1 ? "" : "s"} sin tarifa: ponle
            tarifa en su ficha para que cuente lo que ganó.
          </p>
        ) : null}
      </div>

      {canRecord ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            colVariant="primary"
            rounded="md"
            size="sm"
            onClick={() => onAction({ kind: "cash", row })}
          >
            Recibí efectivo
          </Button>
          <Button
            colVariant="success"
            rounded="md"
            size="sm"
            onClick={() => onAction({ kind: "payout", row })}
          >
            Le pagué
          </Button>
        </div>
      ) : null}

      {open ? <DeliveryDetail deliveryId={row.deliveryId} day={day} /> : null}
    </div>
  );
}

function DeliveryDetail({ deliveryId, day }: { deliveryId: string; day: string }) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const [voiding, setVoiding] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["comercio-settlement", deliveryId, day],
    queryFn: () => getSettlement(deliveryId, day),
  });

  const voidMut = useMutation({
    mutationFn: ({ id, why }: { id: string; why: string }) =>
      voidSettlementEntry(id, why),
    onSuccess: () => {
      setVoiding(null);
      setReason("");
      showAlert("Movimiento anulado", "success");
      queryClient.invalidateQueries({ queryKey: ["comercio-settlement", deliveryId] });
      queryClient.invalidateQueries({ queryKey: ["comercio-settlements"] });
    },
    onError: (err: Error) => showAlert(err.message, "error"),
  });

  if (isLoading) {
    return <Text size="xs" className="mt-3 text-slate-400">Cargando...</Text>;
  }
  if (error || !data) {
    return (
      <Text size="xs" colVariant="danger" className="mt-3">
        {(error as Error)?.message ?? "No se pudo cargar el corte"}
      </Text>
    );
  }

  return (
    <div className="mt-4 space-y-4 border-t border-white/10 pt-4">
      <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-400">
        <span>Venía de antes</span>
        <span className="text-slate-300">
          {cashOwedText(data.opening.cashOwed, "comercio", fmtMoney)} ·{" "}
          {payOwedText(data.opening.payOwed, "comercio", fmtMoney)}
        </span>
      </div>
      {data.delivery?.phone ? (
        <Text size="xs" className="text-slate-500">
          Teléfono: {data.delivery.indicative ?? ""} {data.delivery.phone}
        </Text>
      ) : null}

      <div>
        <Text size="xs" font="semi" className="text-slate-300">
          Movimientos
        </Text>
        {data.entries.length === 0 ? (
          <Text size="xs" className="mt-1 text-slate-500">
            No registraste efectivo recibido ni pagos este día.
          </Text>
        ) : (
          <div className="mt-2 space-y-2">
            {data.entries.map((entry) => {
              const voidable =
                (entry.kind === "cash_received" && entry.status === "confirmed") ||
                (entry.kind === "payout" && entry.status === "pending");

              return (
                <EntryRow key={entry.id} entry={entry}>
                  {voidable ? (
                    voiding === entry.id ? (
                      <div className="mt-2 space-y-2">
                        <textarea
                          rows={2}
                          maxLength={300}
                          value={reason}
                          placeholder="Por qué lo anulas (lo lee el repartidor)"
                          onChange={(e) => setReason(e.target.value)}
                          className="w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-sm text-slate-100"
                        />
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={voidMut.isLoading || reason.trim().length < 5}
                            onClick={() => voidMut.mutate({ id: entry.id, why: reason })}
                            className="rounded-lg bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200 disabled:opacity-40"
                          >
                            Anular
                          </button>
                          <button
                            type="button"
                            onClick={() => setVoiding(null)}
                            className="rounded-lg px-3 py-1 text-xs text-slate-400"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setVoiding(entry.id);
                          setReason("");
                        }}
                        className="mt-2 text-xs text-rose-300 underline"
                      >
                        Lo anoté mal
                      </button>
                    )
                  ) : null}
                </EntryRow>
              );
            })}
          </div>
        )}
      </div>

      <div>
        <Text size="xs" font="semi" className="text-slate-300">
          Pedidos del día
        </Text>
        {data.orders.length === 0 ? (
          <Text size="xs" className="mt-1 text-slate-500">
            Sin entregas ni cobros este día.
          </Text>
        ) : (
          <div className="mt-2 divide-y divide-white/5">
            {data.orders.map((order) => (
              <div key={order.orderId} className="flex justify-between gap-2 py-2 text-xs">
                <span className="min-w-0 truncate text-slate-400">
                  {order.isPriority ? "⚡ " : ""}
                  {order.branchName ? `${order.branchName} · ` : ""}
                  {order.deliveryAddress ?? "Pedido"}
                </span>
                <span className="shrink-0 text-right text-slate-300">
                  {order.cashCollected > 0
                    ? `Cobró ${fmtMoney(order.cashCollected)}`
                    : "Sin efectivo"}
                  {" · "}
                  {order.payAmount !== null ? `ganó ${fmtMoney(order.payAmount)}` : "sin tarifa"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RecordModal({
  action,
  onClose,
}: {
  action: Action | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const showAlert = useAlertStore((state) => state.showAlert);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<SettlementPayoutMethod>("cash");
  const [note, setNote] = useState("");
  const [lastKey, setLastKey] = useState<string | null>(null);

  // Cada vez que se abre para otro repartidor u otra acción, arranca con lo
  // que el corte dice que falta: es lo que casi siempre se va a registrar.
  const key = action ? `${action.kind}:${action.row.deliveryId}` : null;
  if (key !== lastKey) {
    setLastKey(key);
    if (action) {
      const { cashOwed, payOwed } = action.row.closing;
      const suggested = action.kind === "cash" ? cashOwed : payOwed;
      setAmount(suggested > 0 ? String(Math.round(suggested)) : "");
      setMethod(action.kind === "payout" && cashOwed > 0 ? "from_cash" : "cash");
      setNote("");
    }
  }

  const saveMut = useMutation({
    mutationFn: async () => {
      if (!action) return;
      const value = Number(amount);
      if (action.kind === "cash") {
        await recordCashReceived(action.row.deliveryId, {
          amount: value,
          note: note.trim() || undefined,
        });
      } else {
        await recordPayout(action.row.deliveryId, {
          amount: value,
          method,
          note: note.trim() || undefined,
        });
      }
    },
    onSuccess: () => {
      showAlert(
        action?.kind === "cash"
          ? "Efectivo registrado"
          : "Pago registrado: cuenta cuando el repartidor lo confirme",
        "success",
      );
      queryClient.invalidateQueries({ queryKey: ["comercio-settlements"] });
      queryClient.invalidateQueries({ queryKey: ["comercio-settlement"] });
      onClose();
    },
    onError: (err: Error) => showAlert(err.message, "error"),
  });

  const name = action?.row.fullName ?? "el repartidor";

  return (
    <ComercioModal
      isOpen={!!action}
      onClose={onClose}
      title={action?.kind === "cash" ? `Efectivo de ${name}` : `Pago a ${name}`}
      className="!w-[94%] md:!w-[520px] max-w-[96vw]"
    >
      {action ? (
        <div className="space-y-4 p-2">
          <Text size="xs" className="text-gray-500">
            {action.kind === "cash"
              ? `Según los pedidos que marcó como cobrados, ${cashOwedText(action.row.closing.cashOwed, "comercio", fmtMoney).toLowerCase()}.`
              : `${payOwedText(action.row.closing.payOwed, "comercio", fmtMoney)} por sus entregas. El pago cuenta cuando ${name} confirme que le llegó.`}
          </Text>

          <label className="block text-xs text-gray-600">
            Valor (COP)
            <input
              type="number"
              min={1}
              step={500}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={inputCls}
            />
          </label>

          {action.kind === "payout" ? (
            <label className="block text-xs text-gray-600">
              Cómo le pagaste
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as SettlementPayoutMethod)}
                className={inputCls}
              >
                {(Object.keys(PAYOUT_METHOD_LABELS) as SettlementPayoutMethod[]).map(
                  (value) => (
                    <option key={value} value={value}>
                      {PAYOUT_METHOD_LABELS[value]}
                    </option>
                  ),
                )}
              </select>
              {method === "from_cash" ? (
                <span className="mt-1 block text-gray-500">
                  Se quedó con su pago del efectivo que traía: baja lo que te
                  debe en efectivo y lo que tú le debes.
                </span>
              ) : null}
            </label>
          ) : null}

          <label className="block text-xs text-gray-600">
            Nota (opcional)
            <input
              type="text"
              maxLength={300}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={inputCls}
            />
          </label>

          <Button
            colVariant="success"
            size="full"
            rounded="md"
            disabled={saveMut.isLoading || !(Number(amount) > 0)}
            onClick={() => saveMut.mutate()}
          >
            {saveMut.isLoading ? "Guardando..." : "Registrar"}
          </Button>
        </div>
      ) : null}
    </ComercioModal>
  );
}

function EntryRow({ entry, children }: { entry: SettlementEntry; children?: ReactNode }) {
  const inactive = entry.status === "rejected" || entry.status === "voided";

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
      <div className="flex items-start justify-between gap-2 text-sm">
        <span className={inactive ? "text-slate-500 line-through" : "text-slate-200"}>
          {entry.kind === "cash_received"
            ? "Recibiste efectivo"
            : `Le pagaste · ${PAYOUT_METHOD_LABELS[entry.method ?? "cash"]}`}
        </span>
        <span className={`font-semibold ${inactive ? "text-slate-500" : "text-slate-100"}`}>
          {fmtMoney(entry.amount)}
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">
        {ENTRY_STATUS_LABELS[entry.status]}
        {entry.day ? ` · ${entry.day}` : ""}
        {entry.note ? ` · ${entry.note}` : ""}
        {entry.resolutionNote ? ` · Motivo: ${entry.resolutionNote}` : ""}
      </p>
      {children}
    </div>
  );
}

function Big({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
      <Text size="xs" className="text-slate-400">
        {label}
      </Text>
      <p className={`mt-1 text-xl font-semibold ${tone}`}>{value}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-slate-200">{value}</p>
    </div>
  );
}

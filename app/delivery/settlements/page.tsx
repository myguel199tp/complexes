"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Text, Title } from "complexes-next-components";
import { useDeliveryGuard } from "../_lib/delivery-auth";
import DeliveryNav from "../_components/DeliveryNav";
import {
  DeliverySettlementRow,
  confirmSettlementPayout,
  fmtMoney,
  getMySettlement,
  getMySettlements,
  rejectSettlementPayout,
} from "../services/deliveryOrdersService";
import {
  ENTRY_STATUS_LABELS,
  PAYOUT_METHOD_LABELS,
  SettlementEntry,
  cashOwedText,
  dayLabel,
  payOwedText,
  shiftDay,
} from "../services/deliverySettlementTypes";

/**
 * "Corte": las cuentas del día con cada comercio.
 *
 * El efectivo que cobra en la puerta es del local, y lo que gana se lo paga el
 * comercio por fuera de la plataforma. Aquí ve lo mismo que ve el comercio:
 * cuánto cobró, cuánto entregó, cuánto le pagaron y cuánto queda. Los pagos
 * que registra el comercio no cuentan hasta que él los confirma.
 */
export default function DeliverySettlementsPage() {
  const router = useRouter();
  const { session } = useDeliveryGuard(() => router.push("/delivery/login"));
  const ready = session !== null;

  const [day, setDay] = useState<string | undefined>(undefined);
  const [openId, setOpenId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["delivery_settlements", day ?? "today"],
    queryFn: () => getMySettlements(day),
    enabled: ready,
    refetchInterval: 60_000,
  });

  if (!ready) {
    return <div className="p-4 text-center text-slate-400">Cargando...</div>;
  }

  const today = data?.today ?? day;
  const current = data?.day ?? day;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        <DeliveryNav />

        <Title as="h1" size="md" colVariant="on" font="semi">
          Corte del día
        </Title>
        <Text size="xs" className="mt-1 text-slate-500">
          Lo que cobraste en la puerta es del local; lo que ganas te lo paga el
          comercio, no la plataforma. Aquí ves las cuentas igual que las ve él.
        </Text>

        {current && today ? (
          <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-2">
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
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Big
                label="Efectivo por entregar"
                value={fmtMoney(Math.max(0, data.totals.cashOwed))}
                tone="text-amber-300"
              />
              <Big
                label="Te deben"
                value={fmtMoney(Math.max(0, data.totals.payOwed))}
                tone="text-emerald-300"
              />
            </div>
            <Text size="xs" className="mt-2 text-slate-500">
              Al cierre de {current === today ? "hoy" : "ese día"}, sumando
              todos los comercios.
            </Text>

            {data.rows.length === 0 ? (
              <Text size="sm" className="mt-6 text-slate-400">
                Todavía no trabajas para ningún comercio.
              </Text>
            ) : (
              <div className="mt-5 grid gap-3">
                {data.rows.map((row) => (
                  <ComercioCard
                    key={row.comercioId}
                    row={row}
                    day={data.day}
                    open={openId === row.comercioId}
                    onToggle={() =>
                      setOpenId(openId === row.comercioId ? null : row.comercioId)
                    }
                  />
                ))}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}

function ComercioCard({
  row,
  day,
  open,
  onToggle,
}: {
  row: DeliverySettlementRow;
  day: string;
  open: boolean;
  onToggle: () => void;
}) {
  const f = row.dayFigures;
  const paid = f.paidFromCash + f.paidOther;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div>
        <div className="flex items-start justify-between gap-2">
          <Text size="sm" font="semi" className="text-slate-100">
            {row.comercioName ?? "Comercio"}
            {!row.linkActive ? (
              <span className="ml-2 text-xs font-normal text-slate-500">
                (ya no trabajas aquí)
              </span>
            ) : null}
          </Text>
          <button
            type="button"
            onClick={onToggle}
            className="shrink-0 rounded-lg px-2 py-1 text-xs text-cyan-300 hover:bg-white/10"
          >
            {open ? "Cerrar" : "Ver detalle"}
          </button>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Mini label="Entregas" value={String(f.delivered)} />
          <Mini label="Ganado" value={fmtMoney(f.earned)} />
          <Mini label="Cobrado" value={fmtMoney(f.cashCollected)} />
          <Mini label="Entregado / pagado" value={`${fmtMoney(f.cashReceived)} / ${fmtMoney(paid)}`} />
        </div>

        <div className="mt-3 space-y-1 text-sm">
          <p className={row.closing.cashOwed > 0.01 ? "text-amber-300" : "text-slate-300"}>
            {cashOwedText(row.closing.cashOwed, "delivery", fmtMoney)}
          </p>
          <p className={row.closing.payOwed > 0.01 ? "text-emerald-300" : "text-slate-300"}>
            {payOwedText(row.closing.payOwed, "delivery", fmtMoney)}
          </p>
          {row.pendingPayouts.count > 0 ? (
            <p className="font-semibold text-amber-200">
              {row.pendingPayouts.count} pago
              {row.pendingPayouts.count === 1 ? "" : "s"} por confirmar (
              {fmtMoney(row.pendingPayouts.amount)})
            </p>
          ) : null}
          {f.unpriced > 0 ? (
            <p className="text-xs text-slate-500">
              {f.unpriced} entrega{f.unpriced === 1 ? "" : "s"} sin tarifa
              registrada: lo ganado no las cuenta.
            </p>
          ) : null}
        </div>
      </div>

      {open ? <ComercioDetail comercioId={row.comercioId} day={day} /> : null}
    </div>
  );
}

function ComercioDetail({ comercioId, day }: { comercioId: string; day: string }) {
  const queryClient = useQueryClient();
  const [rejecting, setRejecting] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["delivery_settlement", comercioId, day],
    queryFn: () => getMySettlement(comercioId, day),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["delivery_settlement", comercioId] });
    queryClient.invalidateQueries({ queryKey: ["delivery_settlements"] });
    queryClient.invalidateQueries({ queryKey: ["delivery_summary"] });
  };

  const confirmMut = useMutation({
    mutationFn: (id: string) => confirmSettlementPayout(id),
    onSuccess: refresh,
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, why }: { id: string; why: string }) =>
      rejectSettlementPayout(id, why),
    onSuccess: () => {
      setRejecting(null);
      setReason("");
      refresh();
    },
  });

  const actionError = confirmMut.error || rejectMut.error;

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
      <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
        <span>Venía de antes</span>
        <span className="text-right text-slate-300">
          {cashOwedText(data.opening.cashOwed, "delivery", fmtMoney)} ·{" "}
          {payOwedText(data.opening.payOwed, "delivery", fmtMoney)}
        </span>
      </div>

      {actionError ? (
        <Text size="xs" colVariant="danger">
          {(actionError as Error).message}
        </Text>
      ) : null}

      <div>
        <Text size="xs" font="semi" className="text-slate-300">
          Movimientos
        </Text>
        {data.entries.length === 0 ? (
          <Text size="xs" className="mt-1 text-slate-500">
            El comercio no ha registrado efectivo recibido ni pagos este día.
          </Text>
        ) : (
          <div className="mt-2 space-y-2">
            {data.entries.map((entry) => (
              <EntryRow key={entry.id} entry={entry}>
                {entry.kind === "payout" && entry.status === "pending" ? (
                  rejecting === entry.id ? (
                    <div className="mt-2 space-y-2">
                      <textarea
                        rows={2}
                        maxLength={300}
                        value={reason}
                        placeholder="Qué pasó (lo lee el comercio)"
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full rounded-lg border border-white/10 bg-slate-900 px-2 py-1 text-sm text-slate-100"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={rejectMut.isLoading || reason.trim().length < 5}
                          onClick={() => rejectMut.mutate({ id: entry.id, why: reason })}
                          className="rounded-lg bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-200 disabled:opacity-40"
                        >
                          Enviar
                        </button>
                        <button
                          type="button"
                          onClick={() => setRejecting(null)}
                          className="rounded-lg px-3 py-1 text-xs text-slate-400"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        disabled={confirmMut.isLoading}
                        onClick={() => confirmMut.mutate(entry.id)}
                        className="rounded-lg bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 disabled:opacity-40"
                      >
                        Sí, me llegó
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejecting(entry.id);
                          setReason("");
                        }}
                        className="rounded-lg bg-white/5 px-3 py-1 text-xs text-slate-300"
                      >
                        No me llegó
                      </button>
                    </div>
                  )
                ) : null}
              </EntryRow>
            ))}
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
                  {order.deliveryAddress ?? order.branchName ?? "Pedido"}
                </span>
                <span className="shrink-0 text-right text-slate-300">
                  {order.cashCollected > 0
                    ? `Cobraste ${fmtMoney(order.cashCollected)}`
                    : "Sin efectivo"}
                  {" · "}
                  {order.payAmount !== null ? `ganaste ${fmtMoney(order.payAmount)}` : "sin tarifa"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EntryRow({
  entry,
  children,
}: {
  entry: SettlementEntry;
  children?: ReactNode;
}) {
  const inactive = entry.status === "rejected" || entry.status === "voided";

  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/60 p-3">
      <div className="flex items-start justify-between gap-2 text-sm">
        <span className={inactive ? "text-slate-500 line-through" : "text-slate-200"}>
          {entry.kind === "cash_received"
            ? "Le entregaste efectivo"
            : `Te pagó · ${PAYOUT_METHOD_LABELS[entry.method ?? "cash"]}`}
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

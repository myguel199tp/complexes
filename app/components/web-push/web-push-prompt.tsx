"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { IoNotificationsOutline } from "react-icons/io5";

import {
  WebPushKind,
  enableWebPush,
  fetchWebPushKey,
  syncWebPush,
  webPushPermission,
} from "@/app/helpers/webPush";

const COPY: Record<WebPushKind, string> = {
  user: "Visitas en portería, noticias, pedidos y aprobaciones te llegan aunque tengas esta pestaña cerrada.",
  comercio:
    "Pedidos nuevos, cotizaciones y avisos de tus alianzas te llegan aunque tengas esta pestaña cerrada.",
  delivery:
    "Los pedidos que te asignen te llegan aunque tengas esta pestaña cerrada.",
};

/** Quien dijo "Ahora no" no vuelve a ver la tarjeta en este tiempo. */
const SNOOZE_MS = 14 * 24 * 60 * 60 * 1000;

const snoozeKey = (kind: WebPushKind) => `webpush-prompt-snoozed:${kind}`;

function isSnoozed(kind: WebPushKind): boolean {
  try {
    const until = Number(localStorage.getItem(snoozeKey(kind)) ?? 0);
    return until > Date.now();
  } catch {
    return false;
  }
}

function snooze(kind: WebPushKind) {
  try {
    localStorage.setItem(snoozeKey(kind), String(Date.now() + SNOOZE_MS));
  } catch {
    // Sin almacenamiento la tarjeta vuelve a salir en el próximo ingreso y ya.
  }
}

type Props = {
  kind: WebPushKind;
  /** Rutas del panel sin sesión (login, registro), donde no se ofrece. */
  hideOn?: string[];
  /** Si se da, solo en estas rutas. */
  onlyOn?: string[];
};

/**
 * Ofrece activar las notificaciones del navegador y, con el permiso ya dado,
 * mantiene la suscripción a nombre de quien tiene la sesión.
 *
 * No pide el permiso al cargar: el navegador lo muestra una sola vez, y pedido
 * sin contexto casi siempre se niega. Se pide con el clic en "Activar".
 */
export default function WebPushPrompt({ kind, hideOn = [], onlyOn }: Props) {
  const pathname = usePathname() ?? "";
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [blocked, setBlocked] = useState(false);

  const active =
    (!onlyOn || onlyOn.some((prefix) => pathname.startsWith(prefix))) &&
    !hideOn.some((prefix) => pathname.startsWith(prefix));

  useEffect(() => {
    if (!active) return;

    const permission = webPushPermission();

    if (permission === "granted") {
      void syncWebPush(kind);
      return;
    }

    if (permission !== "default" || isSnoozed(kind)) return;

    let cancelled = false;

    // Solo se ofrece si el servidor tiene Web Push configurado.
    void fetchWebPushKey(kind).then((key) => {
      if (!cancelled && key) setVisible(true);
    });

    return () => {
      cancelled = true;
    };
  }, [active, kind]);

  if (!active || !visible) return null;

  const handleEnable = async () => {
    setBusy(true);
    const result = await enableWebPush(kind).catch(() => "unavailable" as const);
    setBusy(false);

    if (result === "denied") {
      setBlocked(true);
      setTimeout(() => setVisible(false), 8000);
      return;
    }

    // Aceptado, o cerró el diálogo sin decidir: se vuelve a ofrecer más adelante.
    if (result === "default") snooze(kind);
    setVisible(false);
  };

  const handleLater = () => {
    snooze(kind);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Activar notificaciones del navegador"
      className="fixed bottom-4 left-1/2 z-[9997] w-[min(calc(100vw-2rem),380px)] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-4 text-slate-800 shadow-xl dark:border-white/10 dark:bg-slate-900 dark:text-slate-100"
    >
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
          <IoNotificationsOutline size={20} aria-hidden />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">
            {blocked
              ? "El navegador bloqueó las notificaciones"
              : "Recibe los avisos en este computador"}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {blocked
              ? "Puedes permitirlas desde el candado que está junto a la dirección de la página."
              : COPY[kind]}
          </p>

          {!blocked && (
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleLater}
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
              >
                Ahora no
              </button>
              <button
                type="button"
                onClick={handleEnable}
                disabled={busy}
                className="rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60 dark:bg-cyan-500 dark:text-slate-950 dark:hover:bg-cyan-400"
              >
                {busy ? "Activando…" : "Activar"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

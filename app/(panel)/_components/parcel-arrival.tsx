"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { MdInventory2 } from "react-icons/md";
import { route } from "@/app/_domain/constants/routes";
import { playNotificationChime } from "@/app/helpers/notificationChime";
import { useParcelPhoto } from "@/app/(panel)/my-citofonia/hooks/useParcelPhoto";
import {
  getMyParcels,
  Parcel,
  parcelDate,
} from "@/app/(panel)/my-citofonia/services/parcelService";

/**
 * Aviso inmediato de un paquete que acaba de llegar a portería, como el de una
 * visita: modal y timbre en el momento, para que el residente baje por él.
 *
 * Antes el paquete solo mandaba el push y "mis paquetes" se refrescaba cada
 * minuto; con la pestaña abierta el residente no se enteraba hasta que pasaba
 * por /my-vip. Si no baja, siguen los recordatorios de siempre del backend.
 *
 * El socket solo trae el id y el estado, y la sala del apartamento no
 * distingue torre: quién ve el modal lo decide `GET /parcel/mine`, que filtra
 * por la unidad del usuario. Así al portero, que está en la sala de todo el
 * conjunto, no le salta el modal de los paquetes ajenos.
 */
export function useParcelArrival(conjuntoId: string) {
  const queryClient = useQueryClient();
  const [arrived, setArrived] = useState<Parcel[]>([]);

  // El conjunto puede cambiar con el modal abierto: lo de antes ya no aplica.
  const conjuntoRef = useRef(conjuntoId);
  conjuntoRef.current = conjuntoId;

  useEffect(() => setArrived([]), [conjuntoId]);

  /** Devuelve si el paquete es de la unidad del usuario y sigue en portería. */
  const show = useCallback(async (parcelId: string) => {
    const conjunto = conjuntoRef.current;
    if (!conjunto) return false;

    try {
      const mine = await getMyParcels(conjunto);
      const parcel = mine.find(
        (item) => item.id === parcelId && item.status === "PENDING",
      );

      if (!parcel || conjuntoRef.current !== conjunto) return false;

      setArrived((current) =>
        current.some((item) => item.id === parcel.id)
          ? current
          : [parcel, ...current],
      );

      return true;
    } catch {
      return false;
    }
  }, []);

  const onParcelChanged = useCallback(
    (change: { id: string; status: string }) => {
      // "Mis paquetes" se pone al día enseguida en vez de esperar el minuto.
      queryClient.invalidateQueries({ queryKey: ["my-parcels"] });

      if (change.status !== "PENDING") {
        // Se entregó o se cerró mientras el modal seguía abierto.
        setArrived((current) => current.filter((item) => item.id !== change.id));
        return;
      }

      void show(change.id).then((isMine) => {
        if (isMine) playNotificationChime();
      });
    },
    [queryClient, show],
  );

  /**
   * Al tocar el push del paquete en el navegador se abre `?parcel=<id>`. Si la
   * pestaña estaba cerrada, el socket no se lo contó a nadie: aquí sale el
   * mismo modal si el paquete sigue en portería. Se quita de la URL para que
   * recargar no lo vuelva a abrir.
   */
  useEffect(() => {
    if (!conjuntoId) return;

    const params = new URLSearchParams(window.location.search);
    const parcelId = params.get("parcel");
    if (!parcelId) return;

    params.delete("parcel");
    const rest = params.toString();
    window.history.replaceState(
      null,
      "",
      window.location.pathname + (rest ? `?${rest}` : ""),
    );

    void show(parcelId);
  }, [conjuntoId, show]);

  return {
    arrived,
    onParcelChanged,
    dismiss: () => setArrived([]),
  };
}

const details = (parcel: Parcel) =>
  [
    parcel.quantity > 1 ? `${parcel.quantity} paquetes` : null,
    parcel.carrier,
    parcel.description,
    parcel.recipientName ? `para ${parcel.recipientName}` : null,
  ]
    .filter(Boolean)
    .join(" · ") || "Paquete";

function ArrivedRow({
  parcel,
  conjuntoId,
}: {
  parcel: Parcel;
  conjuntoId: string;
}) {
  const photo = useParcelPhoto(parcel.id, conjuntoId, Boolean(parcel.photo));

  return (
    <li className="flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/[0.04]">
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt="Foto del paquete"
          className="h-16 w-16 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300">
          <MdInventory2 size={28} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {details(parcel)}
        </p>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          Llegó {parcelDate(parcel.receivedAt)}
        </p>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {parcel.urgent && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-500/15 dark:text-red-300">
              Urgente
            </span>
          )}
          {parcel.damaged && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
              Llegó con daños
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export function ParcelArrivalModal({
  parcels,
  conjuntoId,
  onClose,
}: {
  parcels: Parcel[];
  conjuntoId: string;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!parcels.length) return null;

  const urgent = parcels.some((parcel) => parcel.urgent);
  const count = parcels.reduce((total, parcel) => total + parcel.quantity, 0);

  const title = urgent
    ? count > 1
      ? `🚨 Tienes ${count} paquetes urgentes en portería`
      : "🚨 Tienes un paquete urgente en portería"
    : count > 1
      ? `📦 Tienes ${count} paquetes en portería`
      : "📦 Tienes un paquete en portería";

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="parcel-arrival-title"
    >
      <div
        className={`w-full max-w-md rounded-3xl border bg-white p-6 shadow-2xl animate-fadeIn dark:bg-[#0f172a]/95 ${
          urgent
            ? "border-red-300 dark:border-red-400/40"
            : "border-slate-200 dark:border-white/10"
        }`}
      >
        <h2
          id="parcel-arrival-title"
          className="text-lg font-bold text-slate-900 dark:text-white"
        >
          {title}
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          {urgent
            ? "Es comida o medicina: bájalo a recoger cuanto antes."
            : `Bájalo${count > 1 ? "s" : ""} a recoger en portería.`}
        </p>

        <ul className="mt-4 max-h-[50vh] space-y-2 overflow-y-auto">
          {parcels.map((parcel) => (
            <ArrivedRow key={parcel.id} parcel={parcel} conjuntoId={conjuntoId} />
          ))}
        </ul>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5"
            onClick={() => {
              onClose();
              router.push(route.myvip);
            }}
          >
            Ver mis paquetes
          </button>
          <button
            type="button"
            className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
            onClick={onClose}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}

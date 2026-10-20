"use client";

import { ReactNode, useEffect, useState } from "react";
import { MdClose } from "react-icons/md";

import { getHomeRequestPhoto } from "../services/homeServicesService";

/**
 * Ventana propia y no el `Modal` de la librería: ese es siempre blanco y aquí
 * todo color lleva su variante oscura.
 */
export function Overlay({
  onClose,
  children,
  wide = false,
}: {
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4"
      onClick={onClose}
    >
      <div
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 ${
          wide ? "max-w-3xl" : "max-w-xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-3 top-3 rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10"
        >
          <MdClose size={20} />
        </button>
        {children}
      </div>
    </div>
  );
}

/** Una foto de la solicitud, bajada con la sesión y el conjunto. */
export function PrivatePhoto({
  conjuntoId,
  requestId,
  index,
}: {
  conjuntoId: string;
  requestId: string;
  index: number;
}) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    let objectUrl: string | null = null;
    getHomeRequestPhoto(conjuntoId, requestId, index)
      .then((value) => {
        objectUrl = value;
        if (alive) setUrl(value);
      })
      .catch(() => {});
    return () => {
      alive = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [conjuntoId, requestId, index]);

  if (!url) return <div className="h-20 w-full animate-pulse rounded-lg bg-slate-200 dark:bg-white/10" />;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={`Foto ${index + 1}`} className="h-20 w-full rounded-lg object-cover" />;
}

export const money = (value: number | null | undefined) =>
  value == null ? "—" : `$${Math.round(value).toLocaleString("es-CO")}`;

export const when = (value: string | null) =>
  value
    ? new Date(value).toLocaleString("es-CO", {
        timeZone: "America/Bogota",
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

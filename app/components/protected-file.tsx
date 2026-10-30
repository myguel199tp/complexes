"use client";

import React, { ReactNode, useState } from "react";
import { useAlertStore } from "@/app/components/store/useAlertStore";
import { openProtectedFile, useProtectedFile } from "@/app/hooks/useProtectedFile";

/**
 * Da a una tarjeta el object URL de su archivo protegido, para el `<iframe>` de
 * vista previa y el enlace de "Ver PDF" a la vez: se descarga una sola vez.
 *
 * Va como render prop porque el hook no puede llamarse dentro del `map` que
 * arma las tarjetas.
 */
export function ProtectedFile({
  stored,
  children,
}: {
  stored: string | null | undefined;
  children: (file: { url: string | null; failed: boolean }) => ReactNode;
}) {
  const file = useProtectedFile(stored);

  return <>{children(file)}</>;
}

/**
 * Vista previa de un PDF protegido mientras carga o si falló. Mismo tamaño que
 * el `<iframe>` al que reemplaza, para que la tarjeta no salte al cargar.
 */
export function ProtectedFilePlaceholder({
  failed,
  className = "",
}: {
  failed: boolean;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-center bg-gray-50 text-sm ${
        failed ? "text-red-600" : "text-gray-500"
      } ${className}`}
    >
      {failed ? "No se pudo cargar el PDF" : "Cargando PDF…"}
    </div>
  );
}

/**
 * Enlace que abre un archivo protegido en otra pestaña, descargándolo al hacer
 * clic. Para tablas y listas que no muestran vista previa.
 */
export function ProtectedFileLink({
  stored,
  className,
  children,
}: {
  stored: string | null | undefined;
  className?: string;
  children: ReactNode;
}) {
  const showAlert = useAlertStore((state) => state.showAlert);
  const [opening, setOpening] = useState(false);

  const open = async () => {
    setOpening(true);
    try {
      await openProtectedFile(stored);
    } catch (error) {
      showAlert(
        error instanceof Error ? error.message : "No se pudo abrir el archivo",
        "error",
      );
    } finally {
      setOpening(false);
    }
  };

  return (
    <button
      type="button"
      onClick={open}
      disabled={opening}
      className={`${className ?? ""} disabled:opacity-60 text-left`}
    >
      {children}
    </button>
  );
}

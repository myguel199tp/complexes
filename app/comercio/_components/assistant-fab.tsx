"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoLockClosed, IoSparkles } from "react-icons/io5";
import { useB2bAccess } from "../_lib/use-b2b-access";

/**
 * Rutas donde el botón estorba: en login y registro todavía no hay sesión —el
 * asistente respondería 401— y dentro del propio asistente no tiene sentido.
 */
const HIDDEN_PREFIXES = [
  "/comercio/login",
  "/comercio/register",
  "/comercio/assistant",
];

/**
 * Acceso flotante al asistente, presente en todo el dominio comercio.
 *
 * Antes el único enlace vivía en el dashboard, así que desde pedidos, productos
 * o contratos —donde más se necesita preguntar— no había forma de llegar sin
 * devolverse al panel.
 */
export default function ComercioAssistantFab() {
  const pathname = usePathname();

  const hidden = HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix));

  // En login y registro no hay sesión: preguntar por el plan daría 401 y
  // mandaría al usuario de vuelta al login en mitad del formulario.
  const { can, isLoading, status } = useB2bAccess({ enabled: !hidden });

  if (hidden) return null;

  // Mientras se resuelve el plan no se pinta nada, en vez de mostrarlo y
  // cambiarlo de golpe.
  if (isLoading || !status) return null;

  // Antes un B2B cuyo plan no trae el asistente no veía el botón, y para el
  // proveedor era como si el asistente no existiera. Ahora lo ve con candado:
  // su pantalla le dice qué plan lo incluye. El backend sigue cobrando igual.
  const locked = !can("assistant");

  return (
    <Link
      href="/comercio/assistant"
      data-guide="comercio-assistant"
      aria-label={
        locked
          ? "Asistente del comercio: no incluido en tu plan"
          : "Abrir el asistente del comercio"
      }
      title={
        locked
          ? "Tu plan no incluye el asistente: toca para ver cómo activarlo"
          : "Pregúntale a tu asistente"
      }
      className="
        group fixed bottom-6 right-6 z-50 flex items-center gap-2
        rounded-full border border-cyan-400/40 bg-cyan-600 px-4 py-3
        text-white shadow-lg shadow-cyan-900/40 transition
        hover:bg-cyan-500 focus:outline-none focus-visible:ring-2
        focus-visible:ring-cyan-300
      "
    >
      <IoSparkles size={20} className="shrink-0" />

      {/*
        En pantallas chicas queda solo el icono: una etiqueta fija taparía los
        botones de acción de las tablas de pedidos y productos.
      */}
      <span className="hidden text-sm font-semibold sm:inline">Asistente</span>
      {locked ? (
        <IoLockClosed size={14} className="shrink-0 text-amber-300" />
      ) : null}
    </Link>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { IoSparkles } from "react-icons/io5";

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

  if (HIDDEN_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) {
    return null;
  }

  return (
    <Link
      href="/comercio/assistant"
      aria-label="Abrir el asistente del comercio"
      title="Pregúntale a tu asistente"
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
    </Link>
  );
}

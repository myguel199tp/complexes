"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/my-b2b", label: "Aliados" },
  { href: "/my-b2b/demands", label: "Necesidades" },
  { href: "/my-b2b/contracts", label: "Mis contratos" },
  { href: "/my-b2b/invoices", label: "Facturas" },
];

/**
 * Barra del módulo B2B. Antes cada pantalla llevaba su propio enlace suelto a
 * la siguiente, así que desde contratos no había forma de llegar a facturas;
 * con las necesidades agregadas serían cuatro pantallas encadenadas a mano.
 */
export function B2bNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2 mt-3">
      {TABS.map((tab) => {
        // "/my-b2b" es prefijo de todas, así que solo coincide de forma exacta.
        const active =
          tab.href === "/my-b2b"
            ? pathname === "/my-b2b"
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-3 py-1 text-xs transition border ${
              active
                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                : "border-white/10 bg-white/[0.04] text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

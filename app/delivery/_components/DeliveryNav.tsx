"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { clearDeliveryToken } from "../_lib/delivery-auth";
import { getMyJobRequests } from "../services/deliveryOrdersService";

const TABS = [
  { href: "/delivery/summary", label: "Hoy" },
  { href: "/delivery/orders", label: "Entregas", guide: "delivery-orders" },
  { href: "/delivery/runs", label: "Viajes", guide: "delivery-runs" },
  { href: "/delivery/history", label: "Historial" },
  { href: "/delivery/jobs", label: "Trabajo" },
] as const;

/**
 * Pestañas del repartidor.
 *
 * Antes eran dos pantallas enlazadas entre sí con un "Mis viajes →" suelto, y
 * todo lo demás —cuánto llevaba, qué había entregado ayer, para quién
 * trabajaba— no tenía dónde vivir. "Trabajo" lleva un punto cuando le llegó
 * una invitación: es lo único de esa pestaña que espera una respuesta suya.
 */
export default function DeliveryNav({ enabled = true }: { enabled?: boolean }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();

  const { data: requests } = useQuery({
    queryKey: ["delivery_job_requests"],
    queryFn: getMyJobRequests,
    enabled,
    refetchInterval: 120_000,
  });

  const pendingInvites = (requests ?? []).filter(
    (r) => r.direction === "invitation" && r.status === "pending",
  ).length;

  const logout = async () => {
    await clearDeliveryToken();
    router.push("/delivery/login");
  };

  return (
    <nav className="mb-5 flex items-center gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.04] p-1">
      {TABS.map((tab) => {
        const active = pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            data-guide={"guide" in tab ? tab.guide : undefined}
            className={`relative shrink-0 rounded-xl px-3 py-2 text-sm font-medium transition ${
              active
                ? "bg-cyan-500/20 text-cyan-200"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {tab.label}
            {tab.href === "/delivery/jobs" && pendingInvites > 0 ? (
              <span className="ml-1 rounded-full bg-amber-400 px-1.5 text-[10px] font-bold text-slate-950">
                {pendingInvites}
              </span>
            ) : null}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={logout}
        className="ml-auto shrink-0 rounded-xl px-3 py-2 text-sm text-rose-300 hover:text-rose-200"
      >
        Salir
      </button>
    </nav>
  );
}

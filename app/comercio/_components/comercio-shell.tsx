"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import type { IconType } from "react-icons";
import {
  IoBicycle,
  IoBusiness,
  IoCalendar,
  IoCard,
  IoCart,
  IoClipboard,
  IoClose,
  IoDocumentText,
  IoHammer,
  IoHome,
  IoLayers,
  IoLockClosed,
  IoLogOut,
  IoMegaphone,
  IoMenu,
  IoNavigate,
  IoPricetags,
  IoReceipt,
  IoShieldCheckmark,
  IoSparkles,
} from "react-icons/io5";
import { AlertFlag } from "@/app/components/alertFalg";
import { clearComercioToken } from "../_lib/comercio-auth";
import { getComercioProfile } from "../_lib/comercio-profile";
import { useB2bAccess } from "../_lib/use-b2b-access";
import { getOrders } from "../orders/services/comercioOrderService";
import { getQuotes } from "../b2b/services/b2bQuotesService";
import { getB2bContracts } from "../b2b/services/b2bContractsService";
import { getCompliance } from "../b2b/services/b2bComplianceService";

/** Sin sesión todavía: ni menú ni consultas, que darían 401. */
const NO_SHELL_PREFIXES = ["/comercio/login", "/comercio/register"];

type NavItem = {
  href: string;
  label: string;
  icon: IconType;
  /** Lo que espera acción en esa pantalla. */
  count?: number;
  /** Punto ámbar: algo por resolver que no se cuenta (papeles sin verificar). */
  warn?: boolean;
  locked?: boolean;
};

type NavSection = { title: string; items: NavItem[] };

const isActive = (pathname: string, href: string) =>
  href === "/comercio/dashboard"
    ? pathname === href
    : pathname === href || pathname.startsWith(href + "/");

/**
 * Marco común del panel del comercio: menú lateral fijo en escritorio y cajón
 * con hamburguesa en el celular.
 *
 * Antes la navegación era la cuadrícula de tarjetas del dashboard y cada
 * pantalla tenía su "← Volver al panel": para ir de pedidos a productos había
 * que pasar siempre por el inicio. Las páginas siguen validando la sesión por
 * su cuenta; aquí sólo se pide el perfil para saber qué menú mostrar.
 */
export default function ComercioShell({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname() ?? "";
  const withShell = !NO_SHELL_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix),
  );

  const [open, setOpen] = useState(false);

  // El cajón se cierra al navegar: en el celular taparía la pantalla elegida.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!withShell) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-950 lg:flex">
      <MobileTopBar onOpen={() => setOpen(true)} />

      {open ? (
        <div
          aria-hidden
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      {/*
        Cerrado en el celular va con `hidden` y no fuera de pantalla: la guía de
        Lary busca los ítems por tamaño, y uno trasladado fuera de la vista
        seguiría contando como visible y recibiría el anillo en la nada.
      */}
      {/* Por encima de los botones flotantes del asistente y de Lary (z-50),
          que si no tapaban el pie del cajón. */}
      {/* En escritorio va `fixed` y no `sticky`: el `overflow-x: hidden` de
          html y body en globals.css convierte al body en contenedor de scroll
          y el sticky dejaba de pegarse, así que el menú se iba con la página. */}
      <aside
        id="comercio-sidebar"
        aria-label="Menú del comercio"
        className={`${open ? "flex" : "hidden"} fixed inset-y-0 left-0 z-[60] w-72 max-w-[85vw] flex-col border-r border-white/10 bg-slate-900 shadow-2xl shadow-black/50 lg:z-auto lg:flex lg:w-64 lg:max-w-none lg:bg-white/[0.02] lg:shadow-none`}
      >
        <SidebarContent pathname={pathname} onClose={() => setOpen(false)} />
      </aside>

      <main className="min-w-0 flex-1 lg:ml-64">{children}</main>

      {/* Los avisos de guardado y de error de todas las pantallas del panel
          salen de aquí; login y registro montan el suyo. */}
      <AlertFlag />
    </div>
  );
}

function MobileTopBar({ onOpen }: { onOpen: () => void }) {
  const { data: profile } = useQuery({
    queryKey: ["comercio_profile"],
    queryFn: getComercioProfile,
  });

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-white/10 bg-slate-950/90 px-4 py-3 backdrop-blur-xl lg:hidden">
      <button
        type="button"
        onClick={onOpen}
        aria-label="Abrir menú"
        aria-controls="comercio-sidebar"
        className="rounded-xl border border-white/10 p-2 text-slate-200 transition hover:bg-white/10"
      >
        <IoMenu size={20} />
      </button>

      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-100">
        {profile?.businessName ?? "Panel de Comercio"}
      </span>

      {profile ? <ModelBadge model={profile.businessModel} /> : null}
    </header>
  );
}

function ModelBadge({ model }: { model: "b2b" | "b2c" }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
        model === "b2b"
          ? "bg-purple-500/20 text-purple-300"
          : "bg-cyan-500/20 text-cyan-300"
      }`}
    >
      {model === "b2b" ? "B2B" : "B2C"}
    </span>
  );
}

function SidebarContent({
  pathname,
  onClose,
}: {
  pathname: string;
  onClose: () => void;
}) {
  const router = useRouter();

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["comercio_profile"],
    queryFn: getComercioProfile,
  });
  const isB2b = profile?.businessModel === "b2b";
  const isB2c = profile?.businessModel === "b2c";

  const { can, status } = useB2bAccess();
  // Sin plan vigente todo /comercio/b2b muestra el cobro: no se pregunta por
  // contadores de pantallas a las que no se puede entrar.
  const b2bReady = isB2b && !!status?.planActive;

  // Mismas claves que el dashboard: comparten caché y no se pide dos veces.
  const { data: pendingOrders } = useQuery({
    queryKey: ["comercio_dashboard_pending_orders"],
    queryFn: () => getOrders("pending"),
    enabled: isB2c,
  });
  const { data: openQuotes } = useQuery({
    queryKey: ["comercio_dashboard_b2b_quotes"],
    queryFn: () => getQuotes("requested"),
    enabled: b2bReady,
  });
  const { data: pendingContracts } = useQuery({
    queryKey: ["comercio_dashboard_b2b_pending"],
    queryFn: () => getB2bContracts("pending"),
    enabled: b2bReady,
  });
  const { data: compliance } = useQuery({
    queryKey: ["comercio_dashboard_b2b_compliance"],
    queryFn: getCompliance,
    enabled: b2bReady,
  });

  const handleLogout = async () => {
    await clearComercioToken();
    router.push("/comercio/login");
  };

  const assistant: NavItem = {
    href: "/comercio/assistant",
    label: "Asistente",
    icon: IoSparkles,
    locked: !!status && !can("assistant"),
  };

  const sections: NavSection[] = isB2b
    ? [
        {
          title: "General",
          items: [
            { href: "/comercio/dashboard", label: "Inicio", icon: IoHome },
            assistant,
          ],
        },
        {
          title: "Servicios",
          items: [
            {
              href: "/comercio/b2b/quotes",
              label: "Cotizaciones",
              icon: IoClipboard,
              count: openQuotes?.length,
            },
            {
              href: "/comercio/b2b/contracts",
              label: "Contratos",
              icon: IoDocumentText,
              count: pendingContracts?.length,
            },
            { href: "/comercio/b2b/plans", label: "Planes", icon: IoLayers },
            // Publicidad B2B para administraciones; la de residentes
            // (/comercio/ads) es solo de B2C.
            { href: "/comercio/b2b/featured", label: "Destacados", icon: IoMegaphone },
            // Lo que el plan no incluye no se ofrece: entrar sólo llevaría a
            // la pantalla de "no incluido".
            ...(can("agenda")
              ? [{ href: "/comercio/b2b/agenda", label: "Agenda", icon: IoCalendar }]
              : []),
            ...(can("invoicing")
              ? [
                  {
                    href: "/comercio/b2b/invoices",
                    label: "Facturación",
                    icon: IoReceipt,
                  },
                ]
              : []),
          ],
        },
        {
          title: "Cuenta",
          items: [
            {
              href: "/comercio/b2b/compliance",
              label: "Documentos",
              icon: IoShieldCheckmark,
              warn: !!compliance && !compliance.status.verified,
            },
            {
              href: "/comercio/bank-account",
              label: "Cuenta bancaria",
              icon: IoCard,
            },
          ],
        },
      ]
    : isB2c
      ? [
          {
            title: "General",
            items: [
              { href: "/comercio/dashboard", label: "Inicio", icon: IoHome },
              assistant,
            ],
          },
          {
            title: "Ventas",
            items: [
              {
                href: "/comercio/orders",
                label: "Pedidos",
                icon: IoReceipt,
                count: pendingOrders?.length,
              },
              {
                href: "/comercio/b2c/runs",
                label: "Viajes de entrega",
                icon: IoNavigate,
              },
              // El segundo canal B2C: obras que se cotizan (pisos, cocinas…).
              // No depende de la tienda; el negocio lo activa ahí mismo.
              {
                href: "/comercio/home-quotes",
                label: "Cotizaciones de obra",
                icon: IoHammer,
              },
            ],
          },
          {
            title: "Catálogo",
            items: [
              { href: "/comercio/products", label: "Productos", icon: IoCart },
              {
                href: "/comercio/discounts",
                label: "Promociones",
                icon: IoPricetags,
              },
              { href: "/comercio/ads", label: "Publicidad", icon: IoMegaphone },
            ],
          },
          {
            title: "Operación",
            items: [
              {
                href: "/comercio/branches",
                label: "Sucursales",
                icon: IoBusiness,
              },
              {
                href: "/comercio/deliveries",
                label: "Repartidores",
                icon: IoBicycle,
              },
              {
                href: "/comercio/bank-account",
                label: "Cuenta bancaria",
                icon: IoCard,
              },
            ],
          },
        ]
      : [];

  const accent = isB2b ? "purple" : "cyan";

  return (
    <>
      <div className="flex items-start gap-3 border-b border-white/10 px-4 py-4">
        {profile?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.logoUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded-xl object-cover"
          />
        ) : (
          <span
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
              accent === "purple"
                ? "bg-purple-500/20 text-purple-200"
                : "bg-cyan-500/20 text-cyan-200"
            }`}
          >
            {(profile?.businessName ?? "C").trim().charAt(0).toUpperCase()}
          </span>
        )}

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-slate-100">
            {profile?.businessName ?? "Panel de Comercio"}
          </p>
          <p className="truncate text-xs text-slate-500">
            {profile?.email ?? " "}
          </p>
          {profile ? (
            <div className="mt-1.5">
              <ModelBadge model={profile.businessModel} />
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-slate-100 lg:hidden"
        >
          <IoClose size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {loadingProfile ? (
          <ul className="space-y-2" aria-hidden>
            {Array.from({ length: 6 }).map((_, i) => (
              <li
                key={i}
                className="h-9 animate-pulse rounded-xl bg-white/[0.05]"
              />
            ))}
          </ul>
        ) : (
          sections.map((section) => (
            <div key={section.title} className="mb-5 last:mb-0">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      item={item}
                      active={isActive(pathname, item.href)}
                      accent={accent}
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </nav>

      <div className="border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/10 hover:text-red-200"
        >
          <IoLogOut size={18} className="shrink-0" />
          Cerrar sesión
        </button>
      </div>
    </>
  );
}

function NavLink({
  item,
  active,
  accent,
}: {
  item: NavItem;
  active: boolean;
  accent: "purple" | "cyan";
}) {
  const Icon = item.icon;
  const count = item.count ?? 0;

  const activeClass =
    accent === "purple"
      ? "bg-purple-500/15 text-purple-100 ring-1 ring-inset ring-purple-400/30"
      : "bg-cyan-500/15 text-cyan-100 ring-1 ring-inset ring-cyan-400/30";
  const activeIcon = accent === "purple" ? "text-purple-300" : "text-cyan-300";

  return (
    <Link
      href={item.href}
      data-guide-route={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
        active
          ? activeClass
          : "text-slate-300 hover:bg-white/[0.06] hover:text-slate-100"
      }`}
    >
      <Icon
        size={18}
        className={`shrink-0 ${active ? activeIcon : "text-slate-500"}`}
      />
      <span className="min-w-0 flex-1 truncate">{item.label}</span>

      {count > 0 ? (
        <span
          className="min-w-[20px] rounded-full bg-amber-500 px-1.5 text-center text-[11px] font-bold leading-5 text-slate-950"
          title="Esperan acción tuya"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : item.warn ? (
        <span
          className="h-2 w-2 shrink-0 rounded-full bg-amber-400"
          title="Tienes documentos pendientes"
        />
      ) : item.locked ? (
        <IoLockClosed
          size={14}
          className="shrink-0 text-amber-300"
          aria-label="No incluido en tu plan"
        />
      ) : null}
    </Link>
  );
}

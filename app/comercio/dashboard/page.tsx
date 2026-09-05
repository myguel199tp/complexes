"use client";


import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, Title, Text } from "complexes-next-components";
import { clearComercioToken, useComercioGuard } from "../_lib/comercio-auth";
import { getComercioProfile } from "../_lib/comercio-profile";
import ComercioB2bPaywall from "../_components/b2b-paywall";
import { useB2bAccess } from "../_lib/use-b2b-access";
import {
  IoBicycle,
  IoBusiness,
  IoCard,
  IoCart,
  IoClipboard,
  IoDocumentText,
  IoPricetags,
  IoReceipt,
  IoCalendar,
  IoLayers,
  IoNavigate,
  IoShieldCheckmark,
  IoSparkles,
  IoWarning,
} from "react-icons/io5";
import { getProducts } from "../products/services/comercioProductService";
import { getDeliveries } from "../deliveries/services/comercioDeliveryService";
import { getOrders } from "../orders/services/comercioOrderService";
import { getB2bPlans } from "../b2b/services/b2bPlansService";
import { getB2bContracts } from "../b2b/services/b2bContractsService";
import { getB2bMaintenances } from "../b2b/services/b2bMaintenanceService";
import { getQuotes } from "../b2b/services/b2bQuotesService";
import { getCompliance } from "../b2b/services/b2bComplianceService";

const cardClass =
  "flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center hover:bg-white/[0.08] hover:border-white/20 transition";

export default function ComercioDashboardPage() {
  const router = useRouter();

  // La sesión ahora se confirma contra el servidor; `ready` sigue gobernando
  // cuándo se lanza la query del perfil.
  const { session } = useComercioGuard(() => router.push("/comercio/login"));
  const ready = session !== null;

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["comercio_profile"],
    queryFn: getComercioProfile,
    enabled: ready,
  });

  const isB2b = profile?.businessModel === "b2b";
  const isB2c = profile?.businessModel === "b2c";

  // El asistente es una funcionalidad de plan: a un B2C `can` siempre dice sí.
  // Igual que el perfil, espera a que la sesión esté confirmada.
  const { can } = useB2bAccess({ enabled: ready });

  const handleLogout = async () => {
    await clearComercioToken();
    router.push("/comercio/login");
  };

  if (!ready || loadingProfile || !profile) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  const assistantLink = !can("assistant") ? null : (
    <Link
      href="/comercio/assistant"
      className="mt-5 flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-cyan-500/[0.07] p-4 transition hover:bg-cyan-500/[0.12]"
    >
      <IoSparkles size={24} className="shrink-0 text-cyan-400" />
      <span className="flex flex-col">
        <span className="font-semibold text-slate-100">
          Pregúntale a tu asistente
        </span>
        <span className="text-xs text-slate-400">
          {isB2b
            ? "Contratos, solicitudes pendientes e ingreso recurrente, en una pregunta"
            : "Pedidos, ventas, inventario y repartidores, en una pregunta"}
        </span>
      </span>
    </Link>
  );

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      {/* Antes `max-w-3xl`: con siete accesos y los indicadores nuevos, las
          tarjetas quedaban tan anchas y apretadas que no se distinguían entre
          sí. */}
      <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8 backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <Title as="h1" size="md" colVariant="on" font="semi">
              {profile.businessName ?? "Panel de Comercio"}
            </Title>
            <Text size="sm" className="mt-1 text-slate-500">
              {profile.email}
            </Text>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 ${
              isB2b
                ? "bg-purple-500/20 text-purple-300"
                : "bg-cyan-500/20 text-cyan-300"
            }`}
          >
            {isB2b ? "B2B — Conjuntos" : "B2C — Clientes finales"}
          </span>
        </div>

        {/*
          El asistente sirve a los dos modelos de negocio, así que va arriba y
          fuera del bloque B2B/B2C: por dentro adapta sus respuestas al perfil.
          En B2B queda dentro del paywall porque también es parte de lo que se
          está pagando.
        */}
        {isB2b ? (
          <ComercioB2bPaywall>
            {assistantLink}
            <B2bDashboard />
          </ComercioB2bPaywall>
        ) : isB2c ? (
          <>
            {assistantLink}
            <B2cDashboard />
          </>
        ) : null}

        <Button
          colVariant="danger"
          size="sm"
          rounded="md"
          className="mt-6"
          onClick={handleLogout}
        >
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}

/* ───────────────────────── B2B ───────────────────────── */
function B2bDashboard() {
  const { data: plans } = useQuery({
    queryKey: ["comercio_dashboard_b2b_plans"],
    queryFn: getB2bPlans,
  });
  const { data: pendingContracts } = useQuery({
    queryKey: ["comercio_dashboard_b2b_pending"],
    queryFn: () => getB2bContracts("pending"),
  });
  const { data: activeContracts } = useQuery({
    queryKey: ["comercio_dashboard_b2b_active"],
    queryFn: () => getB2bContracts("active"),
  });
  const { can, limits } = useB2bAccess();
  const hasAgenda = can("agenda");

  const { data: maintenances } = useQuery({
    queryKey: ["comercio_dashboard_b2b_maintenances"],
    queryFn: getB2bMaintenances,
    // Sin agenda en el plan el endpoint responde 403: no se pregunta.
    enabled: hasAgenda,
  });

  // Cotizar y estar al día con los papeles no dependen del plan de acceso, así
  // que estas dos no llevan `enabled`.
  const { data: openQuotes } = useQuery({
    queryKey: ["comercio_dashboard_b2b_quotes"],
    queryFn: () => getQuotes("requested"),
  });
  const { data: compliance } = useQuery({
    queryKey: ["comercio_dashboard_b2b_compliance"],
    queryFn: getCompliance,
  });

  const activePlans = plans?.filter((p) => p.isActive).length ?? 0;
  const pendingCount = pendingContracts?.length ?? 0;
  const activeCount = activeContracts?.length ?? 0;
  const quotesToAnswer = openQuotes?.length ?? 0;

  // Deuda vencida de los conjuntos, que viaja con cada contrato desde que la
  // cobranza se conectó.
  const overdueContracts = (activeContracts ?? []).filter(
    (c) => (c.outstanding?.overdueAmount ?? 0) > 0,
  );

  const docsExpiring = compliance?.status.expiringSoon ?? [];
  const docsMissing = compliance?.status.missing ?? [];
  const verified = compliance?.status.verified ?? false;
  const labelOfDoc = (type: string) =>
    compliance?.rules.find((r) => r.type === type)?.label ?? type;

  /**
   * Lo que hay que atender hoy. Se arma como lista y no como tarjetas sueltas
   * porque el problema del panel anterior no era que faltara información, sino
   * que lo urgente —una solicitud sin responder, un documento por vencer—
   * quedaba al mismo nivel visual que un acceso de navegación.
   */
  const alerts: {
    key: string;
    tone: "danger" | "warn";
    text: string;
    href: string;
    cta: string;
  }[] = [];

  if (pendingCount > 0) {
    alerts.push({
      key: "contracts",
      tone: "warn",
      text: `${pendingCount} solicitud${pendingCount === 1 ? "" : "es"} de alianza sin responder`,
      href: "/comercio/b2b/contracts",
      cta: "Revisar",
    });
  }

  if (quotesToAnswer > 0) {
    alerts.push({
      key: "quotes",
      tone: "warn",
      text: `${quotesToAnswer} cotizaci${quotesToAnswer === 1 ? "ón" : "ones"} por responder`,
      href: "/comercio/b2b/quotes",
      cta: "Cotizar",
    });
  }

  if (docsMissing.length > 0) {
    alerts.push({
      key: "docs-missing",
      tone: "danger",
      text: `No apareces como proveedor verificado: te falta ${docsMissing
        .map(labelOfDoc)
        .join(", ")}`,
      href: "/comercio/b2b/compliance",
      cta: "Subir",
    });
  }

  for (const doc of docsExpiring) {
    alerts.push({
      key: `doc-${doc.type}`,
      tone: doc.days <= 7 ? "danger" : "warn",
      text: `${labelOfDoc(doc.type)} vence ${
        doc.days <= 0 ? "hoy" : `en ${doc.days} día${doc.days === 1 ? "" : "s"}`
      }`,
      href: "/comercio/b2b/compliance",
      cta: "Renovar",
    });
  }

  if (overdueContracts.length > 0) {
    const total = overdueContracts.reduce(
      (sum, c) => sum + (c.outstanding?.overdueAmount ?? 0),
      0,
    );
    alerts.push({
      key: "overdue",
      tone: "danger",
      text: `${total.toLocaleString("es-CO")} vencidos en ${overdueContracts.length} alianza${
        overdueContracts.length === 1 ? "" : "s"
      }`,
      href: "/comercio/b2b/contracts",
      cta: "Ver",
    });
  }

  // El endpoint ya devuelve solo pendientes y vencidos, ordenados por fecha:
  // los primeros son literalmente lo que sigue.
  const upcoming = (maintenances ?? []).slice(0, 5);
  const overdueCount = (maintenances ?? []).filter(
    (m) => m.status === "OVERDUE",
  ).length;

  return (
    <>
      <Text size="sm" className="mt-1 text-slate-500">
        Publica tus planes de servicio y gestiona los contratos que te solicitan
        los conjuntos. Este comercio no maneja sucursales, productos ni
        repartidores.
      </Text>

      {/* El sello va junto al nombre del negocio en la práctica: es lo primero
          que mira un administrador antes de contratar, así que también es lo
          primero que el proveedor tiene que ver de sí mismo. */}
      <div className="mt-4 flex items-center gap-2 flex-wrap">
        {verified ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300">
            <IoShieldCheckmark size={14} /> Proveedor verificado
          </span>
        ) : (
          <Link
            href="/comercio/b2b/compliance"
            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
          >
            <IoShieldCheckmark size={14} /> Sin verificar — completa tus
            documentos
          </Link>
        )}
      </div>

      {alerts.length > 0 && (
        <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
          <div className="flex items-center gap-2">
            <IoWarning size={18} className="text-amber-400 shrink-0" />
            <span className="font-semibold text-slate-100 text-sm">
              Requiere tu atención
            </span>
          </div>

          <ul className="mt-3 flex flex-col divide-y divide-white/5">
            {alerts.map((alert) => (
              <li
                key={alert.key}
                className="flex items-center justify-between gap-3 py-2 flex-wrap"
              >
                <span
                  className={`text-sm ${
                    alert.tone === "danger"
                      ? "text-red-300"
                      : "text-amber-200"
                  }`}
                >
                  {alert.text}
                </span>
                <Link
                  href={alert.href}
                  className="text-xs font-semibold text-cyan-300 hover:text-cyan-200 shrink-0"
                >
                  {alert.cta} →
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-5 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat
          value={activePlans}
          label="Planes activos"
          hint={
            limits?.maxServicePlans != null
              ? `tope ${limits.maxServicePlans}`
              : undefined
          }
        />
        <Stat
          value={pendingCount}
          label="Solicitudes pendientes"
          highlight={pendingCount > 0}
        />
        <Stat
          value={quotesToAnswer}
          label="Cotizaciones por responder"
          highlight={quotesToAnswer > 0}
        />
        <Stat
          value={activeCount}
          label="Contratos activos"
          hint={
            limits?.maxActiveContracts != null
              ? `tope ${limits.maxActiveContracts}`
              : undefined
          }
        />
      </div>

      {/*
        La agenda va antes que los accesos: para un comercio B2B lo urgente no
        es cuántos contratos tiene sino a dónde le toca ir esta semana.
      */}
      {upcoming.length > 0 && (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-slate-100">
              Próximos servicios
            </span>
            {overdueCount > 0 && (
              <span className="rounded-full bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300">
                {overdueCount} vencido(s)
              </span>
            )}
          </div>

          <ul className="mt-3 flex flex-col gap-2">
            {upcoming.map((m) => (
              <li
                key={m.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span className="text-slate-300">
                  {m.commonAreaName}
                  <span className="text-slate-500"> · {m.conjuntoName}</span>
                </span>
                <span
                  className={
                    m.status === "OVERDUE"
                      ? "text-red-300"
                      : "text-slate-400"
                  }
                >
                  {new Date(m.nextMaintenanceDate).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>

          <Link
            href="/comercio/b2b/agenda"
            className="mt-4 inline-block text-xs font-semibold text-cyan-300 hover:text-cyan-200"
          >
            Ver agenda completa →
          </Link>
        </div>
      )}

      {/* Tres columnas y no dos: con siete accesos, dos columnas obligaban a
          bajar hasta el final para saber qué hay. */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Los accesos que el plan no incluye no se muestran: entrar sólo
            llevaría a la pantalla de "no incluido". */}
        {hasAgenda && (
          <Link href="/comercio/b2b/agenda" className={cardClass}>
            <IoCalendar size={28} className="text-purple-400" />
            <span className="text-slate-200 font-semibold">Agenda</span>
            <span className="text-slate-500 text-xs">
              Cuándo y dónde te toca prestar cada servicio
            </span>
          </Link>
        )}

        {can("invoicing") && (
          <Link href="/comercio/b2b/invoices" className={cardClass}>
            <IoReceipt size={28} className="text-purple-400" />
            <span className="text-slate-200 font-semibold">Facturación</span>
            <span className="text-slate-500 text-xs">
              Cobros emitidos a los conjuntos y su seguimiento
            </span>
          </Link>
        )}

        <Link href="/comercio/b2b/plans" className={cardClass}>
          <IoLayers size={28} className="text-purple-400" />
          <span className="text-slate-200 font-semibold">Planes</span>
          <span className="text-slate-500 text-xs">
            Crea y administra tus planes de servicio recurrente
          </span>
        </Link>

        {/* Cada sección con su propio icono: cotizaciones, cumplimiento y
            contratos compartían `IoDocumentText` y eran indistinguibles de un
            vistazo, que es justo para lo que sirve una cuadrícula de accesos. */}
        <Link href="/comercio/b2b/quotes" className={cardClass}>
          <div className="relative">
            <IoClipboard size={28} className="text-purple-400" />
            {quotesToAnswer > 0 && <Badge value={quotesToAnswer} />}
          </div>
          <span className="text-slate-200 font-semibold">Cotizaciones</span>
          <span className="text-slate-500 text-xs">
            Responde los trabajos a la medida que te piden cotizar
          </span>
        </Link>

        <Link href="/comercio/b2b/compliance" className={cardClass}>
          <IoShieldCheckmark
            size={28}
            className={verified ? "text-emerald-400" : "text-amber-400"}
          />
          <span className="text-slate-200 font-semibold">
            Documentos y cumplimiento
          </span>
          <span className="text-slate-500 text-xs">
            ARL, pólizas y cámara al día para salir como proveedor verificado
          </span>
        </Link>

        <Link href="/comercio/b2b/contracts" className={cardClass}>
          <div className="relative">
            <IoDocumentText size={28} className="text-purple-400" />
            {pendingCount > 0 && <Badge value={pendingCount} />}
          </div>
          <span className="text-slate-200 font-semibold">Contratos</span>
          <span className="text-slate-500 text-xs">
            Confirma o rechaza las solicitudes de los conjuntos
          </span>
        </Link>

        <Link href="/comercio/bank-account" className={cardClass}>
          <IoCard size={28} className="text-purple-400" />
          <span className="text-slate-200 font-semibold">Cuenta bancaria</span>
          <span className="text-slate-500 text-xs">
            Verifica con OTP la cuenta donde recibirás tus pagos
          </span>
        </Link>
      </div>
    </>
  );
}

/* ───────────────────────── B2C ───────────────────────── */
function B2cDashboard() {
  const { data: products } = useQuery({
    queryKey: ["comercio_dashboard_products"],
    queryFn: () => getProducts(),
  });
  const { data: deliveries } = useQuery({
    queryKey: ["comercio_dashboard_deliveries"],
    queryFn: () => getDeliveries(),
  });
  const { data: pendingOrders } = useQuery({
    queryKey: ["comercio_dashboard_pending_orders"],
    queryFn: () => getOrders("pending"),
  });

  const productsCount = products?.length ?? 0;
  const activeDeliveriesCount =
    deliveries?.filter((d) => d.isActive).length ?? 0;
  const pendingOrdersCount = pendingOrders?.length ?? 0;

  return (
    <>
      <Text size="sm" className="mt-1 text-slate-500">
        Desde aquí administras tu catálogo de productos, los repartidores
        encargados de las entregas y el seguimiento de los pedidos que recibes
        de tus clientes.
      </Text>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Stat value={productsCount} label="Productos activos" />
        <Stat value={activeDeliveriesCount} label="Repartidores activos" />
        <Stat
          value={pendingOrdersCount}
          label="Pedidos pendientes"
          highlight={pendingOrdersCount > 0}
        />
      </div>

      {/* Tres columnas y no cuatro: son seis accesos, así que cuatro dejaba dos
          huérfanos en la segunda fila. */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Link href="/comercio/branches" className={cardClass}>
          <IoBusiness size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">Sucursales</span>
          <span className="text-slate-500 text-xs">
            Crea y administra las sucursales desde donde operas
          </span>
        </Link>

        <Link href="/comercio/products" className={cardClass}>
          <IoCart size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">Productos</span>
          <span className="text-slate-500 text-xs">
            Crea, edita y controla el stock y disponibilidad de tu catálogo
          </span>
        </Link>

        <Link href="/comercio/deliveries" className={cardClass}>
          <IoBicycle size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">Repartidores</span>
          <span className="text-slate-500 text-xs">
            Registra a tus deliveries y activa o desactiva su acceso
          </span>
        </Link>

        <Link href="/comercio/orders" className={cardClass}>
          <IoReceipt size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">Pedidos</span>
          <span className="text-slate-500 text-xs">
            Confirma, asigna repartidor y da seguimiento a cada pedido
          </span>
        </Link>

        <Link href="/comercio/b2c/runs" className={cardClass}>
          <IoNavigate size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">
            Viajes de entrega
          </span>
          <span className="text-slate-500 text-xs">
            Agrupa pedidos de un conjunto y genera el código de portería
          </span>
        </Link>

        <Link href="/comercio/discounts" className={cardClass}>
          <IoPricetags size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">Promociones</span>
          <span className="text-slate-500 text-xs">
            Crea descuentos por producto, categoría o todo el pedido
          </span>
        </Link>

        <Link href="/comercio/bank-account" className={cardClass}>
          <IoCard size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">Cuenta bancaria</span>
          <span className="text-slate-500 text-xs">
            Verifica con OTP la cuenta donde recibirás tus pagos
          </span>
        </Link>
      </div>
    </>
  );
}

/**
 * Contador sobre el icono de un acceso. Repite un número que ya está en los
 * indicadores de arriba a propósito: quien entra directo a la cuadrícula no
 * debería tener que subir a leerlos para saber dónde hay trabajo pendiente.
 */
function Badge({ value }: { value: number }) {
  return (
    <span className="absolute -right-2 -top-1 min-w-[18px] rounded-full bg-amber-500 px-1 text-center text-[10px] font-bold leading-[18px] text-slate-950">
      {value > 9 ? "9+" : value}
    </span>
  );
}

function Stat({
  value,
  label,
  highlight,
  hint,
}: {
  value: number;
  label: string;
  highlight?: boolean;
  /** Tope del plan de acceso, cuando lo hay. */
  hint?: string;
}) {
  return (
    <div
      className={`rounded-2xl border p-3 text-center ${
        highlight
          ? "border-amber-500/25 bg-amber-500/[0.06]"
          : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <span
        className={`block text-2xl font-semibold ${
          highlight ? "text-amber-400" : "text-slate-100"
        }`}
      >
        {value}
      </span>
      <span className="text-slate-500 text-xs leading-tight block">
        {label}
      </span>
      {hint && <span className="block text-slate-600 text-[10px]">{hint}</span>}
    </div>
  );
}

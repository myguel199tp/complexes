"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Button, Title } from "complexes-next-components";
import { clearComercioToken, getComercioToken } from "../_lib/comercio-auth";
import { getComercioProfile } from "../_lib/comercio-profile";
import {
  IoBicycle,
  IoBusiness,
  IoCard,
  IoCart,
  IoDocumentText,
  IoPricetags,
  IoReceipt,
  IoLayers,
} from "react-icons/io5";
import { getProducts } from "../products/services/comercioProductService";
import { getDeliveries } from "../deliveries/services/comercioDeliveryService";
import { getOrders } from "../orders/services/comercioOrderService";
import { getB2bPlans } from "../b2b/services/b2bPlansService";
import { getB2bContracts } from "../b2b/services/b2bContractsService";

const cardClass =
  "flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition";

export default function ComercioDashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getComercioToken();
    if (!token) {
      router.push("/comercio/login");
      return;
    }
    setReady(true);
  }, [router]);

  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["comercio_profile"],
    queryFn: getComercioProfile,
    enabled: ready,
  });

  const isB2b = profile?.businessModel === "b2b";
  const isB2c = profile?.businessModel === "b2c";

  const handleLogout = () => {
    clearComercioToken();
    router.push("/comercio/login");
  };

  if (!ready || loadingProfile || !profile) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <div className="flex items-center justify-between gap-2">
          <Title as="h1" size="md" colVariant="on" font="semi">
            Panel de Comercio
          </Title>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isB2b
                ? "bg-purple-500/20 text-purple-300"
                : "bg-cyan-500/20 text-cyan-300"
            }`}
          >
            {isB2b ? "B2B — Conjuntos" : "B2C — Clientes finales"}
          </span>
        </div>

        <p className="mt-2 text-slate-400">
          Sesión iniciada como <strong>{profile.email}</strong>
        </p>

        {isB2b ? (
          <B2bDashboard />
        ) : isB2c ? (
          <B2cDashboard />
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

  const activePlans = plans?.filter((p) => p.isActive).length ?? 0;
  const pendingCount = pendingContracts?.length ?? 0;
  const activeCount = activeContracts?.length ?? 0;

  return (
    <>
      <p className="mt-1 text-slate-500 text-sm">
        Publica tus planes de servicio y gestiona los contratos que te solicitan
        los conjuntos. Este comercio no maneja sucursales, productos ni
        repartidores.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat value={activePlans} label="Planes activos" />
        <Stat
          value={pendingCount}
          label="Solicitudes pendientes"
          highlight={pendingCount > 0}
        />
        <Stat value={activeCount} label="Contratos activos" />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/comercio/b2b/plans" className={cardClass}>
          <IoLayers size={28} className="text-purple-400" />
          <span className="text-slate-200 font-semibold">Planes</span>
          <span className="text-slate-500 text-xs text-center">
            Crea y administra tus planes de servicio recurrente
          </span>
        </Link>

        <Link href="/comercio/b2b/contracts" className={cardClass}>
          <IoDocumentText size={28} className="text-purple-400" />
          <span className="text-slate-200 font-semibold">Contratos</span>
          <span className="text-slate-500 text-xs text-center">
            Confirma o rechaza las solicitudes de los conjuntos
          </span>
        </Link>

        <Link href="/comercio/bank-account" className={cardClass}>
          <IoCard size={28} className="text-purple-400" />
          <span className="text-slate-200 font-semibold">Cuenta bancaria</span>
          <span className="text-slate-500 text-xs text-center">
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
      <p className="mt-1 text-slate-500 text-sm">
        Desde aquí administras tu catálogo de productos, los repartidores
        encargados de las entregas y el seguimiento de los pedidos que recibes
        de tus clientes.
      </p>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Stat value={productsCount} label="Productos activos" />
        <Stat value={activeDeliveriesCount} label="Repartidores activos" />
        <Stat
          value={pendingOrdersCount}
          label="Pedidos pendientes"
          highlight={pendingOrdersCount > 0}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Link href="/comercio/branches" className={cardClass}>
          <IoBusiness size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">Sucursales</span>
          <span className="text-slate-500 text-xs text-center">
            Crea y administra las sucursales desde donde operas
          </span>
        </Link>

        <Link href="/comercio/products" className={cardClass}>
          <IoCart size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">Productos</span>
          <span className="text-slate-500 text-xs text-center">
            Crea, edita y controla el stock y disponibilidad de tu catálogo
          </span>
        </Link>

        <Link href="/comercio/deliveries" className={cardClass}>
          <IoBicycle size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">Repartidores</span>
          <span className="text-slate-500 text-xs text-center">
            Registra a tus deliveries y activa o desactiva su acceso
          </span>
        </Link>

        <Link href="/comercio/orders" className={cardClass}>
          <IoReceipt size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">Pedidos</span>
          <span className="text-slate-500 text-xs text-center">
            Confirma, asigna repartidor y da seguimiento a cada pedido
          </span>
        </Link>

        <Link href="/comercio/discounts" className={cardClass}>
          <IoPricetags size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">Promociones</span>
          <span className="text-slate-500 text-xs text-center">
            Crea descuentos por producto, categoría o todo el pedido
          </span>
        </Link>

        <Link href="/comercio/bank-account" className={cardClass}>
          <IoCard size={28} className="text-cyan-400" />
          <span className="text-slate-200 font-semibold">Cuenta bancaria</span>
          <span className="text-slate-500 text-xs text-center">
            Verifica con OTP la cuenta donde recibirás tus pagos
          </span>
        </Link>
      </div>
    </>
  );
}

function Stat({
  value,
  label,
  highlight,
}: {
  value: number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2 text-center">
      <span
        className={`block text-2xl font-semibold ${
          highlight ? "text-amber-400" : "text-slate-100"
        }`}
      >
        {value}
      </span>
      <span className="text-slate-500 text-xs">{label}</span>
    </div>
  );
}

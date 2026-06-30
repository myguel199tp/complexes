"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { jwtDecode } from "jwt-decode";
import { useQuery } from "@tanstack/react-query";
import { Button, Title } from "complexes-next-components";
import { clearComercioToken, getComercioToken } from "../_lib/comercio-auth";
import {
  IoBicycle,
  IoBusiness,
  IoCard,
  IoCart,
  IoPricetags,
  IoReceipt,
  IoWallet,
} from "react-icons/io5";
import { getProducts } from "../products/services/comercioProductService";
import { getDeliveries } from "../deliveries/services/comercioDeliveryService";
import { getOrders } from "../orders/services/comercioOrderService";
import { getComercioPaymentStatus } from "../payment/services/comercioPaymentService";

interface ComercioTokenPayload {
  id: string;
  email: string;
  type: "comercio";
}

export default function ComercioDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const token = getComercioToken();

    if (!token) {
      router.push("/comercio/login");
      return;
    }

    try {
      const payload = jwtDecode<ComercioTokenPayload>(token);
      setEmail(payload.email);
    } catch {
      clearComercioToken();
      router.push("/comercio/login");
    }
  }, [router]);

  const paymentStatusQuery = useQuery({
    queryKey: ["comercio_dashboard_payment_status"],
    queryFn: getComercioPaymentStatus,
    enabled: !!email,
  });

  const isPlanActive =
    !!paymentStatusQuery.data?.planActive &&
    paymentStatusQuery.data?.billingPeriod === "anual";

  useEffect(() => {
    if (paymentStatusQuery.data && !isPlanActive) {
      router.push("/comercio/payment");
    }
  }, [paymentStatusQuery.data, isPlanActive, router]);

  const { data: products } = useQuery({
    queryKey: ["comercio_dashboard_products"],
    queryFn: getProducts,
    enabled: !!email && isPlanActive,
  });

  const { data: deliveries } = useQuery({
    queryKey: ["comercio_dashboard_deliveries"],
    queryFn: getDeliveries,
    enabled: !!email && isPlanActive,
  });

  const { data: pendingOrders } = useQuery({
    queryKey: ["comercio_dashboard_pending_orders"],
    queryFn: () => getOrders("pending"),
    enabled: !!email && isPlanActive,
  });

  const handleLogout = () => {
    clearComercioToken();
    router.push("/comercio/login");
  };

  if (!email || paymentStatusQuery.isLoading || !paymentStatusQuery.data) {
    return <div className="p-4 text-center">Cargando...</div>;
  }

  if (!isPlanActive) {
    return (
      <div className="p-4 text-center text-slate-400">
        Redirigiendo a activación de plan...
      </div>
    );
  }

  const productsCount = products?.length ?? 0;
  const activeDeliveriesCount =
    deliveries?.filter((d) => d.isActive).length ?? 0;
  const pendingOrdersCount = pendingOrders?.length ?? 0;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <Title as="h1" size="lg" colVariant="on" font="semi">
          Panel de Comercio
        </Title>

        <p className="mt-2 text-slate-400">
          Sesión iniciada como <strong>{email}</strong>
        </p>

        <p className="mt-1 text-slate-500 text-sm">
          Desde aquí administras tu catálogo de productos, los repartidores
          encargados de las entregas y el seguimiento de los pedidos que
          recibes de tus clientes.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <span className="block text-2xl font-semibold text-slate-100">
              {productsCount}
            </span>
            <span className="text-slate-500 text-xs">Productos activos</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <span className="block text-2xl font-semibold text-slate-100">
              {activeDeliveriesCount}
            </span>
            <span className="text-slate-500 text-xs">
              Repartidores activos
            </span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
            <span
              className={`block text-2xl font-semibold ${pendingOrdersCount > 0 ? "text-amber-400" : "text-slate-100"}`}
            >
              {pendingOrdersCount}
            </span>
            <span className="text-slate-500 text-xs">Pedidos pendientes</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <Link
            href="/comercio/branches"
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition"
          >
            <IoBusiness size={28} className="text-cyan-400" />
            <span className="text-slate-200 font-semibold">Sucursales</span>
            <span className="text-slate-500 text-xs text-center">
              Crea y administra las sucursales desde donde operas
            </span>
          </Link>

          <Link
            href="/comercio/products"
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition"
          >
            <IoCart size={28} className="text-cyan-400" />
            <span className="text-slate-200 font-semibold">Productos</span>
            <span className="text-slate-500 text-xs text-center">
              Crea, edita y controla el stock y disponibilidad de tu catálogo
            </span>
          </Link>

          <Link
            href="/comercio/deliveries"
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition"
          >
            <IoBicycle size={28} className="text-cyan-400" />
            <span className="text-slate-200 font-semibold">Repartidores</span>
            <span className="text-slate-500 text-xs text-center">
              Registra a tus deliveries y activa o desactiva su acceso
            </span>
          </Link>

          <Link
            href="/comercio/orders"
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition"
          >
            <IoReceipt size={28} className="text-cyan-400" />
            <span className="text-slate-200 font-semibold">Pedidos</span>
            <span className="text-slate-500 text-xs text-center">
              Confirma, asigna repartidor y da seguimiento a cada pedido
            </span>
          </Link>

          <Link
            href="/comercio/discounts"
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition"
          >
            <IoPricetags size={28} className="text-cyan-400" />
            <span className="text-slate-200 font-semibold">Promociones</span>
            <span className="text-slate-500 text-xs text-center">
              Crea descuentos por producto, categoría o todo el pedido
            </span>
          </Link>

          <Link
            href="/comercio/bank-account"
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition"
          >
            <IoCard size={28} className="text-cyan-400" />
            <span className="text-slate-200 font-semibold">
              Cuenta bancaria
            </span>
            <span className="text-slate-500 text-xs text-center">
              Verifica con OTP la cuenta donde recibirás tus pagos
            </span>
          </Link>

          <Link
            href="/comercio/payment"
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.08] transition"
          >
            <IoWallet size={28} className="text-cyan-400" />
            <span className="text-slate-200 font-semibold">Mi plan</span>
            <span className="text-slate-500 text-xs text-center">
              Consulta tu plan, próximo pago y activa tu suscripción
            </span>
          </Link>
        </div>

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

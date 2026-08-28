"use client";

import Link from "next/link";
import { Text, Title } from "complexes-next-components";
import { IoLockClosed } from "react-icons/io5";
import { B2bFeature, useB2bAccess } from "../_lib/use-b2b-access";

const FEATURE_LABEL: Record<B2bFeature, string> = {
  agenda: "la agenda de mantenimientos",
  invoicing: "la facturación y el seguimiento de cobros",
  assistant: "el asistente inteligente",
};

/**
 * Muestra `children` sólo si el plan de acceso del comercio incluye la
 * funcionalidad; si no, explica por qué no y a dónde ir a cambiar de plan.
 *
 * Es la cara visible del límite: el backend rechaza igual la llamada, así que
 * esto existe para no ofrecer una pantalla que iba a responder 403.
 */
export default function PlanFeatureGate({
  feature,
  children,
}: Readonly<{ feature: B2bFeature; children: React.ReactNode }>) {
  const { can, isLoading, planName } = useB2bAccess();

  if (isLoading) {
    return <div className="p-4 text-center text-slate-400">Cargando...</div>;
  }

  if (can(feature)) return <>{children}</>;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-2xl">
        <div className="flex items-start gap-3">
          <IoLockClosed size={24} className="mt-1 shrink-0 text-amber-400" />
          <div>
            <Title as="h1" size="sm" colVariant="on" font="semi">
              No incluido en tu plan
            </Title>
            <Text size="sm" className="mt-2 text-slate-400">
              {planName ? `Tu plan ${planName}` : "Tu plan actual"} no incluye{" "}
              {FEATURE_LABEL[feature]}. Cambia de plan para habilitarlo.
            </Text>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/comercio/dashboard"
            className="rounded-xl border border-cyan-500/40 bg-cyan-500/[0.12] px-4 py-2 text-sm font-semibold text-cyan-200 transition hover:bg-cyan-500/20"
          >
            Ver planes
          </Link>
          <Link
            href="/comercio/dashboard"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-slate-300 transition hover:bg-white/[0.06]"
          >
            ← Volver al panel
          </Link>
        </div>
      </div>
    </div>
  );
}

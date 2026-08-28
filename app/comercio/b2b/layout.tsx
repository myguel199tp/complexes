"use client";

import ComercioB2bPaywall from "../_components/b2b-paywall";

/**
 * Todo lo que cuelga de /comercio/b2b es lo que el comercio está pagando, así
 * que el cobro se aplica en el layout: entrar por URL directa a agenda,
 * planes, contratos o facturas sin suscripción vigente muestra el módulo de
 * cobro en lugar de la pantalla.
 */
export default function ComercioB2bLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return <ComercioB2bPaywall standalone>{children}</ComercioB2bPaywall>;
}

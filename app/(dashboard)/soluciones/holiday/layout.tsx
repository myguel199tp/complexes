import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Reservas y alquiler vacacional interno",
  description:
    "Reserva de zonas comunes y alquiler vacacional solo para miembros del conjunto, con control de cupos, turnos y reglas automáticas de uso.",
  path: "/soluciones/holiday",
});

/**
 * Sólo aporta metadata: la página ya trae su propio <main>, así que el layout
 * no envuelve nada para no anidar dos landmarks.
 */
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

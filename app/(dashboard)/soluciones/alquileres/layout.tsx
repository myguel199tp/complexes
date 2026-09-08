import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Control de arriendos y huéspedes",
  description:
    "Registro de huéspedes, control de fechas de estadía e historial de alquileres del conjunto residencial, para que la administración sepa siempre quién ocupa cada inmueble.",
  path: "/soluciones/alquileres",
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

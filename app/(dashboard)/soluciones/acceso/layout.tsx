import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Control de acceso y visitantes",
  description:
    "Registro digital de visitantes, control de vehículos e historial de accesos del conjunto residencial, con trazabilidad para la portería y la administración.",
  path: "/soluciones/acceso",
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

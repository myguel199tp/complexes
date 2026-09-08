import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Soluciones para constructoras",
  description:
    "Gestión de preventas, entrega digital de inmuebles y comunidad activa desde el primer día para proyectos de vivienda nueva.",
  path: "/soluciones/constructoras",
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

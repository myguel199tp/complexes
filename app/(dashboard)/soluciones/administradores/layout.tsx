import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Software para administradores de propiedad horizontal",
  description:
    "Administra el conjunto con control y claridad: cartera, comunicados, documentos, visitantes y asambleas en una sola plataforma que reduce la carga operativa.",
  path: "/soluciones/administradores",
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

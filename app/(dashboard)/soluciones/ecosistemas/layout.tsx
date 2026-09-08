import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Modelo de ecosistema",
  description:
    "Cómo se conectan residentes, administración, comercios aliados y proveedores dentro del ecosistema globaliaph.",
  path: "/soluciones/ecosistemas",
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

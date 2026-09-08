import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Reputación y directorio de aliados",
  description:
    "Cómo funcionan las alianzas y la reputación verificada de los proveedores que trabajan con los conjuntos de la red.",
  path: "/us/privat",
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

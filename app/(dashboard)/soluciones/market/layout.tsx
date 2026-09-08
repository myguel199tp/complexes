import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Marketplace interno del conjunto",
  description:
    "Marketplace privado del conjunto residencial: los residentes compran y venden entre vecinos, con visibilidad limitada a la comunidad y publicaciones controladas.",
  path: "/soluciones/market",
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

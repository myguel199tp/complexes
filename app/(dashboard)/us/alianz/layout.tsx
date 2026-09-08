import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Alianzas para comercios",
  description:
    "Registra tu comercio, elige tu modelo B2C o B2B y haz visible tu marca en el directorio de aliados y en las tiendas de los conjuntos residenciales.",
  path: "/us/alianz",
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

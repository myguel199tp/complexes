import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Comunicados y cartelera digital",
  description:
    "Cartelera digital, chat directo y grupos de chat para que los comunicados del conjunto lleguen a todos los residentes y dejen constancia.",
  path: "/soluciones/comunicaciones",
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

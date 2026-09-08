import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Beneficios del Club",
  description:
    "Herramientas y ventajas que el Club Digital pone a disposición del conjunto: reservas, control de accesos y servicios negociados en red.",
  path: "/us/benefits",
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

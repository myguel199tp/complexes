import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Inteligencia colectiva de la red",
  description:
    "Alertas tempranas de morosidad, reportes comparativos y análisis preventivo construidos con los datos agregados de la red de conjuntos.",
  path: "/us/colective",
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

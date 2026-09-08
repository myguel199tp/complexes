import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Trabaja con nosotros",
  description:
    "Vacantes y oportunidades para sumarte al equipo que digitaliza la administración de conjuntos residenciales.",
  path: "/soluciones/jobuse",
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

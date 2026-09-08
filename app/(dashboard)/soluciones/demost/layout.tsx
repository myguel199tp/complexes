import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Solicitar demostración",
  description:
    "Agenda una demostración de globaliaph con un asesor y ve cómo funciona la plataforma con los datos y las necesidades reales de tu conjunto.",
  path: "/soluciones/demost",
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

import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Asistente virtual para residentes",
  description:
    "El asistente de globaliaph responde las dudas de residentes y administración sobre el conjunto sin esperar a nadie, disponible las 24 horas.",
  path: "/soluciones/assistente",
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

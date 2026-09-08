import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Planes y precios",
  description:
    "Precios públicos de globaliaph para conjuntos residenciales, con lo que incluye cada plan y las respuestas a las dudas más frecuentes antes de firmar.",
  path: "/soluciones/planes",
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

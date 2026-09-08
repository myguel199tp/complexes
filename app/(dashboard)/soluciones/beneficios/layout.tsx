import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Red de beneficios comunitarios",
  description:
    "Beneficios y descuentos negociados para los residentes y la copropiedad gracias al volumen de la red de conjuntos residenciales de globaliaph.",
  path: "/soluciones/beneficios",
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

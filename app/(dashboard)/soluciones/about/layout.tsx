import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Club Digital de conjuntos residenciales",
  description:
    "El Club Digital de globaliaph reúne a los conjuntos residenciales en una red con niveles Básico, Oro y Platino: beneficios, convenios y poder de negociación colectivo para la copropiedad.",
  path: "/soluciones/about",
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

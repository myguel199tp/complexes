import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Conjuntos residenciales digitales",
  description:
    "Digitalizar el conjunto residencial ordena la información, elimina el papel y mejora la experiencia de residentes, administración y portería.",
  path: "/soluciones/conjuntos",
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

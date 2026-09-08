import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Gestión documental de la copropiedad",
  description:
    "Publica actas, reglamentos y estados financieros para la comunidad, guarda los archivos privados de la administración y organiza todo por categorías.",
  path: "/soluciones/documental",
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

import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Convenios y proveedores aliados",
  description:
    "Convenios con proveedores y comercios para la copropiedad: precios negociados en red y reputación verificada de cada aliado.",
  path: "/soluciones/convenios",
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

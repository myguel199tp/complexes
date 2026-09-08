import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Citofonía virtual sin cables ni equipos",
  description:
    "Citofonía virtual para conjuntos residenciales: autoriza visitantes y domicilios desde el celular, sin instalar equipos y con menos costos operativos para la copropiedad.",
  path: "/soluciones/citofonia",
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

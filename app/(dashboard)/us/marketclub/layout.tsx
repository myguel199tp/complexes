import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Market del Club",
  description:
    "Dotación, aseo, iluminación y repuestos de uso recurrente para la copropiedad, con precios negociados por el volumen de la red.",
  path: "/us/marketclub",
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

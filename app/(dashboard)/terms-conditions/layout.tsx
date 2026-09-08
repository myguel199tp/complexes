import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Términos y condiciones",
  description:
    "Términos y condiciones de uso de la plataforma globaliaph para conjuntos residenciales, residentes y comercios aliados.",
  path: "/terms-conditions",
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

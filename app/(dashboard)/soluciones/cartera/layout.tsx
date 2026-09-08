import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Cartera y facturación de la administración",
  description:
    "Facturación de cuotas de administración, verificación de pagos, control de morosidad y cobro jurídico del conjunto residencial en un solo flujo.",
  path: "/soluciones/cartera",
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

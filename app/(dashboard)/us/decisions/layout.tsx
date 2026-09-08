import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Cómo se toman las decisiones",
  description:
    "Qué módulos se construyen primero, cómo evolucionan los flujos de la operación diaria y qué condiciones se buscan al negociar con los proveedores de la red.",
  path: "/us/decisions",
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

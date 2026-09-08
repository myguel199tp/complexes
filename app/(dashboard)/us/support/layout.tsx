import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Soporte y acompañamiento",
  description:
    "Asistente disponible siempre para dudas de uso, soporte humano para configuración y permisos, y acompañamiento en la implementación.",
  path: "/us/support",
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

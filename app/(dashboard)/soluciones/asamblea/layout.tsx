import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Asambleas virtuales con votación",
  description:
    "Asambleas de copropietarios en línea: validación automática de quórum, votaciones ponderadas por coeficiente, resultados en tiempo real e historial verificable.",
  path: "/soluciones/asamblea",
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

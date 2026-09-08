import { Metadata } from "next";

/**
 * Pantalla de acceso: no aporta nada en buscadores y sólo generaría resultados
 * duplicados con /auth, así que se marca noindex además del disallow de
 * robots.txt (el disallow evita el rastreo; el noindex, la indexación de una
 * URL que ya estuviera enlazada desde fuera).
 */
export const metadata: Metadata = {
  title: "Inicio de sesión",
  robots: { index: false, follow: false },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}

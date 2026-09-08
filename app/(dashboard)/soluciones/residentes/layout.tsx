import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Beneficios para residentes",
  description:
    "Tu conjunto en el celular: comunicados, pases de acceso, PQR, reservas, documentos y pagos, sin depender de horarios ni de la cartelera.",
  path: "/soluciones/residentes",
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

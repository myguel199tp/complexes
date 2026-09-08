import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Contacto",
  description:
    "Habla con el equipo de globaliaph: resolvemos dudas sobre la plataforma, los planes y la implementación en tu conjunto residencial.",
  path: "/soluciones/contact",
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

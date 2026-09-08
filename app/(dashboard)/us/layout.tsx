import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Nosotros y el Club Digital",
  description:
    "Quiénes somos y cómo funciona el Club Digital de globaliaph: la red de conjuntos residenciales que negocia en bloque, comparte información y decide qué se construye.",
  path: "/us",
  hasChildRoutes: true,
});

/** Conserva el <main> que ya traía esta pantalla; sólo se le añade la metadata. */
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="min-h-screen min-w-full">{children}</main>;
}

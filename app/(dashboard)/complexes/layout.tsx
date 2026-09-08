import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Software de gestión para conjuntos residenciales",
  description:
    "globaliaph reúne la administración del conjunto residencial en una sola plataforma: citofonía virtual, visitantes, cartera, asambleas, comunicados, documentos y marketplace de comercios aliados.",
  socialDescription:
    "Citofonía virtual, visitantes, cartera, asambleas, comunicados y marketplace de aliados para tu conjunto residencial.",
  path: "/complexes",
});

/**
 * Portada real del sitio: "/" sólo redirige aquí, así que es esta URL la que se
 * declara canónica y la que va en el sitemap.
 */
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="min-h-screen min-w-full">{children}</main>;
}

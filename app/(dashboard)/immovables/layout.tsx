import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Venta y arriendo de inmuebles",
  description:
    "Apartamentos, casas y locales en venta y arriendo publicados por propietarios y residentes de conjuntos verificados. Filtra por ciudad, precio y tipo de inmueble.",
  path: "/immovables",
});

/** Conserva el <main> que ya traía esta pantalla; sólo se le añade la metadata. */
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="min-h-screen min-w-full">{children}</main>;
}

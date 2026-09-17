import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Directorio de empresas aliadas",
  description:
    "Directorio público de empresas aliadas de globaliaph: proveedores verificados que le prestan servicios a la copropiedad, con sus planes, su precio y las calificaciones de los conjuntos que ya los contrataron.",
  path: "/advertisements",
});

/** Conserva el <main> que ya traía esta pantalla; sólo se le añade la metadata. */
export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="min-h-screen min-w-full">{children}</main>;
}

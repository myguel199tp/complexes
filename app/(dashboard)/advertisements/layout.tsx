import { pageMetadata } from "@/app/_domain/constants/seo";

export const metadata = pageMetadata({
  title: "Comercios aliados",
  description:
    "Directorio de comercios aliados de globaliaph: empresas B2B que prestan servicios a la copropiedad y tiendas B2C que venden a los residentes con entrega en su conjunto.",
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

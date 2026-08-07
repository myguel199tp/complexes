import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aliados | SmartPH",
  description:
    "Comercios aliados de SmartPH: empresas B2B que prestan servicios a la copropiedad y tiendas B2C que venden a los residentes con entrega en su conjunto.",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="min-h-screen min-w-full">{children}</main>;
}

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio de sesión Comercio | SmartPH",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="min-h-screen min-w-full">{children}</main>;
}

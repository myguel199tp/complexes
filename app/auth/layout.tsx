import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio de sesión",
  // Pantalla de acceso: fuera del índice, no hay nada que posicionar.
  robots: { index: false, follow: false },
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="min-h-screen min-w-full">{children}</main>;
}

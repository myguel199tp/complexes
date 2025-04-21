import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reserva vacacional | Complexes",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="min-h-screen min-w-full">{children}</main>;
}

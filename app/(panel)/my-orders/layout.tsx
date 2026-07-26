import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis pedidos | SmartPH",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}

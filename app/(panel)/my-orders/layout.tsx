import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mis pedidos | globaliaph",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}

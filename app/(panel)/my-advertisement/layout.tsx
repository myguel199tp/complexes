import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anuncio | globaliaph",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}

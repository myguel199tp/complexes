import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reserva vacacional | globaliaph",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}

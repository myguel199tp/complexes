import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Regsitro | globaliaph",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <main className="min-h-screen min-w-full">{children}</main>;
}

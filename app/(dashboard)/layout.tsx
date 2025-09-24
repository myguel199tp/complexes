"use client";
// app/layout.tsx (o donde estés manejando tu layout raíz)
import React from "react";
import TopMenu from "../components/ui/top-menu";
import { AlertFlag } from "../components/alertFalg";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="px-5">
      <TopMenu />
      {children}
      <AlertFlag />
    </div>
  );
}

"use client";
import React from "react";
import TopMenu from "../components/ui/top-menu";
import { AlertFlag } from "../components/alertFalg";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      {/* MENU FIJO */}
      <div
        className="
    fixed top-0 left-0 w-full z-50 px-5
    bg-white/10
    backdrop-blur-xl
    border-b border-white/10
  "
      >
        {" "}
        <TopMenu />
      </div>

      {/* ESPACIO PARA QUE EL CONTENIDO NO QUEDE DEBAJO DEL MENU */}
      <main className="pt-24 px-5">{children}</main>

      <AlertFlag />
    </div>
  );
}

import { Metadata } from "next";
import React, { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Noticias | Complexes",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="w-full p-4">
      <div>{children}</div>
    </div>
  );
}

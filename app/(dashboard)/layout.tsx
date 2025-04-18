import React from "react";
import TopMenu from "../components/ui/top-menu";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="main-h-screen px-5">
      <TopMenu />
      {children}
    </main>
  );
}

import React from "react";
import TopMenu from "../components/ui/top-menu";
import Sidebar from "../components/ui/sidebar";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="main-h-screen px-5">
      <TopMenu /> <Sidebar />
      {children}
    </main>
  );
}

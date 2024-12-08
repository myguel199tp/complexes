import React from "react";
import Sidebar from "../components/ui/sidebar";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <main className=" flex mt-4 gap-4">
      <Sidebar />
      {children}
    </main>
  );
}

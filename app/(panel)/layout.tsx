import React from "react";
import Sidebar from "../components/ui/sidebar";
import Chatear from "../components/ui/citofonie-message/chatear";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex mt-4 gap-4 w-full">
      <div className="flex w-[90%]">
        <Sidebar />
        <div className="flex-1 overflow-auto">{children}</div>{" "}
        {/* Ocupa espacio restante */}
      </div>
      <div className="w-[10%] h-12">
        <Chatear />
      </div>
    </main>
  );
}

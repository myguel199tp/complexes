import React from "react";
import Sidebar from "../components/ui/sidebar";
import Chatear from "../components/ui/citofonie-message/chatear";

export default function layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex mt-4 gap-4 w-full">
      <div className="flex w-[90%]">
        <Sidebar />
        {children}
      </div>
      <div className="w-[10%]">
        <Chatear />
      </div>
    </main>
  );
}

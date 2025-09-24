"use client";

import React, { useState } from "react";
import Sidebar from "../components/ui/sidebar";
import { AlertFlag } from "../components/alertFalg";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarWidth = isCollapsed ? "ml-[70px]" : "ml-[230px]";

  return (
    <main className=" bg-gray-300 mt-4 flex">
      <div className="fixed top-4 left-0 h-[calc(100vh-1rem)] z-50">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div className={`transition-all duration-300 w-full ${sidebarWidth}`}>
        <div className="p-4 min-h-screen overflow-auto">{children}</div>
        <AlertFlag />
      </div>
    </main>
  );
}

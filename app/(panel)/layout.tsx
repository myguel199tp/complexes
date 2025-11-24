"use client";

import React, { useState } from "react";
import Sidebar from "../components/ui/sidebar";
import { AlertFlag } from "../components/alertFalg";
import MenuTop from "../components/ui/menuTop";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarWidth = isCollapsed ? "ml-[70px]" : "ml-[230px]";

  return (
    <main className="mt-2 flex">
      <div className="fixed top-4 left-0 h-[calc(100vh-1rem)] z-50">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div className={`transition-all duration-300 w-full ${sidebarWidth}`}>
        <div className="p-4 min-h-screen overflow-auto">
          <div className="hidden md:block transition-all rounded-sm duration-300 flex-col items-center shadow-md bg-transparent ">
            <MenuTop />
          </div>
          {children}
        </div>
        <AlertFlag />
      </div>
    </main>
  );
}

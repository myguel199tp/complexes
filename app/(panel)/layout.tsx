"use client";

import React, { useState } from "react";
import Sidebar from "../components/ui/sidebar";
import { AlertFlag } from "../components/alertFalg";
import MenuTop from "../components/ui/menuTop";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarSize = isCollapsed ? "w-[70px]" : "w-[230px]";
  const contentWidth = isCollapsed
    ? "w-[calc(100%-70px)]"
    : "w-[calc(100%-230px)]";

  return (
    <main className="mt-2 flex">
      <div
        className={`fixed top-4 left-0 h-[calc(100vh-1rem)] z-50 ${sidebarSize}`}
      >
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div className={`transition-all duration-300 ml-auto ${contentWidth}`}>
        <div className="p-4 min-h-screen overflow-x-hidden">
          <div className="hidden md:block sticky top-2 z-40 mb-4 rounded-sm shadow-md">
            <MenuTop />
          </div>

          {children}
        </div>

        <AlertFlag />
      </div>
    </main>
  );
}

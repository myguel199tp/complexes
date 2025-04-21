"use client";

import React, { useState } from "react";
import Sidebar from "../components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Ancho dinámico del sidebar
  const sidebarWidth = isCollapsed ? "ml-[70px]" : "ml-[230px]";

  return (
    <main className="w-full mt-4 flex">
      {/* Sidebar fijo a la izquierda */}
      <div className="fixed top-4 left-0 h-[calc(100vh-1rem)] z-50">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Contenido que se ajusta dinámicamente al ancho del sidebar */}
      <div className={`transition-all duration-300 w-full ${sidebarWidth}`}>
        <div className="p-4 min-h-screen overflow-auto">{children}</div>
      </div>
    </main>
  );
}

"use client";

import React, { useState } from "react";
import Sidebar from "../components/ui/sidebar";
import { AlertFlag } from "../components/alertFalg";
import { useVisitSocket } from "./my-citofonia/hooks/useVisitSocket";
import { Visit, VisitStatus } from "./my-citofonia/services/response/visit";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // 🔥 estado del modal
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sidebarSize = isCollapsed ? "w-[70px]" : "w-[230px]";
  const contentWidth = isCollapsed
    ? "w-[calc(100%-70px)]"
    : "w-[calc(100%-230px)]";

  // 🔌 SOCKET (tiempo real)
  useVisitSocket((visit) => {
    // 👉 solo mostrar si está pendiente
    if (visit.status === VisitStatus.PENDING) {
      setCurrentVisit(visit);
      setIsModalOpen(true);

      // 🔊 sonido (opcional)
      const audio = new Audio("/sounds/notification.mp3");
      audio.play().catch(() => {});
    }
  });

  return (
    <main className="flex">
      {/* SIDEBAR */}
      <div
        className={`fixed top-4 left-0 h-[calc(100vh-1rem)] z-50 ${sidebarSize}`}
      >
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* CONTENIDO */}
      <div className={`transition-all duration-300 ml-auto ${contentWidth}`}>
        <div className="p-1 min-h-screen overflow-x-hidden">{children}</div>

        <AlertFlag />
      </div>

      {/* 🔥 MODAL GLOBAL */}
      {isModalOpen && currentVisit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6 animate-fadeIn">
            <h2 className="text-xl font-bold mb-4">🚨 Visitante en portería</h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Nombre:</strong> {currentVisit.namevisit}
              </p>
              <p>
                <strong>Documento:</strong> {currentVisit.numberId}
              </p>
              <p>
                <strong>Apartamento:</strong> {currentVisit.apartment}
              </p>
              <p>
                <strong>Tipo:</strong> {currentVisit.visitType}
              </p>
            </div>

            {/* BOTONES */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full bg-gray-300 hover:bg-gray-400 text-black py-2 rounded"
              >
                Cerrar
              </button>

              <button
                onClick={() => {
                  console.log("Autorizar visita", currentVisit.id);
                  setIsModalOpen(false);
                }}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
              >
                Autorizar
              </button>

              <button
                onClick={() => {
                  console.log("Rechazar visita", currentVisit.id);
                  setIsModalOpen(false);
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

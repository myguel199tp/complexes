"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/ui/sidebar";
import { AlertFlag } from "../components/alertFalg";
import { useVisitSocket } from "./my-citofonia/hooks/useVisitSocket";
import { Visit, VisitStatus } from "./my-citofonia/services/response/visit";
import { parseCookies } from "nookies";
import { useConjuntoStore } from "../(sets)/ensemble/components/use-store";
import { useInfoQuery } from "./my-vip/_components/use-info-query";

export default function Layout({ children }: { children: React.ReactNode }) {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, error, isLoading } = useInfoQuery() as {
    data?: unknown;
    error?: unknown;
    isLoading: boolean;
  };

  // 🔥 SOCKET
  useVisitSocket({
    onNewVisit: (visit) => {
      if (visit.status === VisitStatus.PENDING) {
        setCurrentVisit(visit);
        setIsModalOpen(true);

        const audio = new Audio("/sounds/notification.mp3");
        audio.play().catch(() => {});
      }
    },

    onVisitUpdated: (visit) => {
      if (visit.id === currentVisit?.id) {
        setCurrentVisit(visit);
        setIsModalOpen(true);

        setTimeout(() => {
          setIsModalOpen(false);
          setCurrentVisit(null);
        }, 3000);
      }
    },
  });

  // 🔥 REFRESH TIEMPO EN VIVO
  useEffect(() => {
    if (!currentVisit) return;

    const interval = setInterval(() => {
      setCurrentVisit((prev) => (prev ? { ...prev } : prev));
    }, 1000);

    return () => clearInterval(interval);
  }, [currentVisit]);

  if (isLoading) return null;
  if (error || !data) return null;

  const sidebarSize = isCollapsed ? "w-[70px]" : "w-[230px]";
  const contentWidth = isCollapsed
    ? "w-[calc(100%-70px)]"
    : "w-[calc(100%-230px)]";

  // 🔥 FUNCIONES
  function getDuration(visit: Visit) {
    if (!visit.entryTime) return 0;

    const end = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const start = new Date(visit.entryTime);

    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }

  function getCost(visit: Visit) {
    if (!visit.hasParking || !visit.entryTime) return 0;

    const end = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const start = new Date(visit.entryTime);

    const hours = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60),
    );

    return hours * (visit.parkingRatePerHour || 0);
  }

  function formatTime(mins: number) {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
  }

  const duration = currentVisit ? getDuration(currentVisit) : 0;
  const cost = currentVisit ? getCost(currentVisit) : 0;

  // 🔥 URL IMAGEN
  const getImageUrl = () => {
    if (!currentVisit) return null;

    if (currentVisit.file) {
      return `${process.env.NEXT_PUBLIC_API_URL}/${currentVisit.file}`;
    }

    if (currentVisit.file) {
      return currentVisit.file;
    }

    return null;
  };

  // 🔥 ACTIONS
  const authorizeVisit = async (id: string) => {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/visit/authorize/${id}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "x-conjunto-id": conjuntoId,
        },
        credentials: "include",
      },
    );
  };

  const denyVisit = async (id: string) => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/visit/deny/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "x-conjunto-id": conjuntoId,
      },
      credentials: "include",
    });
  };

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

      {/* 🔥 MODAL */}
      {isModalOpen && currentVisit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-[90%] max-w-md p-6 animate-fadeIn">
            {/* 📸 IMAGEN */}
            {getImageUrl() && (
              <img
                src={getImageUrl()!}
                alt="visitante"
                className="w-full h-40 object-cover rounded-md mb-4"
              />
            )}

            {/* 🧠 TITULO */}
            <h2 className="text-xl font-bold mb-4">
              {currentVisit.status === VisitStatus.PENDING &&
                "🚨 Visitante en portería"}
              {currentVisit.status === VisitStatus.INSIDE &&
                "⏱️ Visitante dentro"}
              {currentVisit.status === VisitStatus.DENIED &&
                "❌ Visitante rechazado"}
            </h2>

            {/* 📋 INFO */}
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

              {currentVisit.entryTime && (
                <p>
                  <strong>Tiempo:</strong>{" "}
                  <span className="text-blue-600 font-semibold">
                    {formatTime(duration)}
                  </span>
                </p>
              )}

              {currentVisit.hasParking && (
                <p>
                  <strong>Parqueadero:</strong>{" "}
                  <span className="text-green-600 font-bold">
                    ${cost.toLocaleString("es-CO")}
                  </span>
                </p>
              )}
            </div>

            {/* 🔘 BOTONES */}
            {currentVisit.status === VisitStatus.PENDING && (
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-black py-2 rounded"
                >
                  Cerrar
                </button>

                <button
                  onClick={() => authorizeVisit(currentVisit.id)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Autorizar
                </button>

                <button
                  onClick={() => denyVisit(currentVisit.id)}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded"
                >
                  Rechazar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "../components/ui/sidebar";
import { AlertFlag } from "../components/alertFalg";
import { useVisitSocket } from "./my-citofonia/hooks/useVisitSocket";
import { Visit, VisitStatus } from "./my-citofonia/services/response/visit";
import { parseCookies } from "nookies";
import { useConjuntoStore } from "../(sets)/ensemble/components/use-store";
import { useInfoQuery } from "./my-vip/_components/use-info-query";
import { FaPersonShelter } from "react-icons/fa6";
import Allvisit from "../components/allvisit";
import AssistantChat from "./my-new-user/_components/assistantChat";
import { Avatar } from "complexes-next-components";

export default function Layout({ children }: { children: React.ReactNode }) {
  const cookies = parseCookies();
  const token = cookies.accessToken;

  const [isCollapsed, setIsCollapsed] = useState(false);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";

  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showVisitors, setShowVisitors] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(true);
  const { data, error, isLoading } = useInfoQuery() as {
    data?: unknown;
    error?: unknown;
    isLoading: boolean;
  };

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
  useEffect(() => {
    if (openChat) return;

    const timer = setTimeout(() => {
      setShowWelcomeTooltip(true);
    }, 1000);

    const hide = setTimeout(() => {
      setShowWelcomeTooltip(false);
    }, 6000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hide);
    };
  }, []);

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
    <main className="flex bg-[#dde5f0] min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-500/10 blur-3xl rounded-full pointer-events-none" />
      <div
        className={`fixed top-4 left-0 h-[calc(100vh-1rem)] z-50 ${sidebarSize}`}
      >
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div className={`transition-all duration-300 ml-auto ${contentWidth}`}>
        <div className="p-4 md:p-6 min-h-screen overflow-x-hidden relative z-10">
          <div className="relative inline-block">
            <FaPersonShelter
              className="flex m-5 cursor-pointer text-cyan-900"
              size={25}
              onClick={() => setShowVisitors((prev) => !prev)}
            />

            {showVisitors && (
              <div
                className="
                absolute left-5 top-full mt-3 w-72
                bg-white/10
                backdrop-blur-2xl
                border border-white/10
                rounded-2xl
                shadow-2xl
                z-50
                overflow-hidden
                "
                onClick={(e) => e.stopPropagation()}
              >
                <Allvisit />
              </div>
            )}
          </div>

          {children}
        </div>

        <AlertFlag />
      </div>
      {isModalOpen && currentVisit && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="
            bg-[#0f172a]/95
            backdrop-blur-2xl
            border border-white/10
            rounded-3xl
            shadow-[0_0_60px_rgba(0,255,255,0.15)]
            w-[90%]
            max-w-md
            p-6
            animate-fadeIn
            text-white
          "
          >
            {getImageUrl() && (
              <img
                src={getImageUrl()!}
                alt="visitante"
                className="
                w-full
                h-48
                object-cover
                rounded-2xl
                mb-5
                border border-white/10
                "
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
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
        {/* 👋 Tooltip de entrada (saludo inicial) */}
        {showWelcomeTooltip && !openChat && (
          <div className="bg-white shadow-lg rounded-lg px-3 py-2 text-sm animate-bounce">
            👋 Hola, ¿en qué puedo ayudarte?
          </div>
        )}

        {/* 🖱️ Tooltip hover */}
        <div className="relative group">
          <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block bg-white shadow-lg rounded-lg px-3 py-2 text-sm whitespace-nowrap">
            👋 ¿Necesitas ayuda?
          </div>

          {/* 🤖 Chat panel */}
          {openChat && (
            <div className="w-[380px] h-[600px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
              <AssistantChat />
            </div>
          )}

          {/* Floating button */}
          <Avatar
            src="/gcmplx.png"
            alt={"SmarPH"}
            size="sm"
            border="thick"
            shape="round"
            className="w-20 h-20 rounded-full cursor-pointer text-white shadow-xl flex items-center justify-center hover:scale-110 transition-all duration-200"
            onClick={() => setOpenChat((prev) => !prev)}
          />
        </div>
      </div>
    </main>
  );
}

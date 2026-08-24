/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "../components/ui/sidebar";
import { AlertFlag } from "../components/alertFalg";
import { useVisitSocket } from "./my-citofonia/hooks/useVisitSocket";
import { useVisitFile } from "./my-citofonia/hooks/useVisitFile";
import { Visit, VisitStatus } from "./my-citofonia/services/response/visit";
import { useConjuntoStore } from "../(sets)/ensemble/components/use-store";
import { FaPersonShelter } from "react-icons/fa6";
import { ImSpinner9 } from "react-icons/im";
import Allvisit from "../components/allvisit";
import AssistantChat from "./my-new-user/_components/assistantChat";
import {
  Avatar,
  Button,
  Buton,
  Tooltip,
  Text,
} from "complexes-next-components";
import Chatear from "../components/ui/citofonie-message/chatear";
import { fetchWithAuth } from "../helpers/fetchWithAuth";
import { useSidebarInformation } from "@/app/components/ui/sidebar-information";
import { route } from "@/app/_domain/constants/routes";
import {
  useEmergencySocket,
  EmergencyActivatedPayload,
} from "./my-emergency/hooks/useEmergencySocket";
import { useActiveEmergency } from "./my-emergency/_components/useEmergency";

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId) ?? "";
  const { valueState } = useSidebarInformation();
  const { userRolName } = valueState;
  const hasRole = (role: string) => userRolName.includes(role);

  const [loading, setLoading] = useState<string | null>(null);
  const handleNavigate = (key: string, path: string) => {
    setLoading(key);
    router.push(path);
  };

  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [, forceUpdate] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [resolvingVisit, setResolvingVisit] = useState(false);
  const [visitError, setVisitError] = useState<string | null>(null);

  /**
   * La foto se pintaba con `${API_URL}/${visit.file}`, pero `file` es la ruta en
   * disco del backend y esos adjuntos ya no se sirven como estáticos: hay que
   * pedirlos al endpoint autenticado.
   */
  const visitImage = useVisitFile(
    currentVisit?.id,
    "attachment",
    conjuntoId || undefined,
    !!currentVisit?.file,
  );
  const [showVisitors, setShowVisitors] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(true);

  const [emergencyAlert, setEmergencyAlert] =
    useState<EmergencyActivatedPayload | null>(null);

  const { data: activeEmergency } = useActiveEmergency(conjuntoId);

  useEffect(() => {
    if (activeEmergency) {
      setEmergencyAlert({
        emergencyId: activeEmergency.id,
        type: activeEmergency.type,
        customTypeLabel: activeEmergency.customTypeLabel,
        instructions: activeEmergency.instructions,
        evacuationRoute: activeEmergency.evacuationRoute,
        meetingPoint: activeEmergency.meetingPoint,
        title: "🚨 Emergencia activa",
        body: activeEmergency.instructions || "Sigue las instrucciones del personal de emergencia.",
      });
    }
  }, [activeEmergency?.id]);

  useEmergencySocket({
    onActivated: (payload) => {
      setEmergencyAlert(payload);

      const audio = new Audio("/sounds/notification.mp3");
      audio.play().catch(() => {});
    },
    onResolved: () => {
      setEmergencyAlert(null);
    },
  });

  useVisitSocket({
    onNewVisit: (visit) => {
      if (visit.status === VisitStatus.PENDING) {
        setCurrentVisit(visit);
        setVisitError(null);
        setIsModalOpen(true);

        const audio = new Audio("/sounds/notification.mp3");
        audio.play().catch(() => {});
      }
    },

    onVisitUpdated: (visit) => {
      setCurrentVisit((prev) => {
        if (prev?.id !== visit.id) return prev;
        return visit;
      });
    },
  });
  useEffect(() => {
    setLoading(null);
  }, [pathname]);

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
    const interval = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [!!currentVisit]);

  /**
   * El modal se cierra solo cuando la visita deja de estar pendiente, venga la
   * resolución de este usuario o de otro residente de la misma unidad.
   */
  useEffect(() => {
    if (!isModalOpen || !currentVisit) return;
    if (currentVisit.status === VisitStatus.PENDING) return;

    const timer = setTimeout(() => {
      setIsModalOpen(false);
      setCurrentVisit(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [isModalOpen, currentVisit?.id, currentVisit?.status]);


  const sidebarSize = isCollapsed
    ? "w-[40px] md:w-[70px]"
    : "w-[40px] md:w-[230px]";
  const contentWidth = isCollapsed
    ? "w-[calc(100%-40px)] md:w-[calc(100%-70px)]"
    : "w-[calc(100%-40px)] md:w-[calc(100%-230px)]";

  function getDuration(visit: Visit) {
    if (!visit.entryTime) return 0;

    const end = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const start = new Date(visit.entryTime);

    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
  }

  /**
   * `parkingAmount` es el cobro congelado a la salida y manda sobre cualquier
   * cuenta del cliente. Mientras el visitante no haya cruzado la reja no hay
   * `entryTime` y por tanto no hay nada acumulado: ahí lo que se muestra es la
   * tarifa, no un total en cero.
   */
  function getCost(visit: Visit) {
    if (!visit.hasParking) return 0;
    if (visit.parkingAmount != null) return visit.parkingAmount;
    if (!visit.entryTime) return 0;

    const end = visit.exitTime ? new Date(visit.exitTime) : new Date();
    const start = new Date(visit.entryTime);

    // Se cobra la hora empezada, igual que en el backend.
    const hours = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60)),
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

  /**
   * Antes no se miraba la respuesta: un 409 se tragaba en silencio, el modal
   * seguía abierto y el residente volvía a pulsar sobre una visita ya resuelta.
   * `resolvingVisit` corta además el doble clic, que era la causa habitual del
   * "La visita ya fue resuelta".
   */
  const resolveVisit = async (id: string, action: "authorize" | "deny") => {
    if (resolvingVisit) return;

    setResolvingVisit(true);
    setVisitError(null);

    try {
      const res = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_URL}/api/visit/${action}/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-conjunto-id": conjuntoId,
          },
        },
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setVisitError(body?.message ?? "No se pudo procesar la visita");
        return;
      }

      const updated = (await res.json()) as Visit;
      setCurrentVisit(updated);
    } catch {
      setVisitError("No se pudo conectar con el servidor");
    } finally {
      setResolvingVisit(false);
    }
  };

  const authorizeVisit = (id: string) => resolveVisit(id, "authorize");
  const denyVisit = (id: string) => resolveVisit(id, "deny");

  return (
    <main className="flex bg-gradient-to-br from-[#020617] via-[#0a1224] to-[#071019] min-h-screen relative overflow-hidden">
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-cyan-500/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-fuchsia-500/15 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-indigo-500/10 blur-3xl rounded-full pointer-events-none" />
      <div
        className={`fixed top-4 left-0 h-[calc(100vh-1rem)] z-20 ${sidebarSize}`}
      >
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <div className={`transition-all duration-300 ml-auto ${contentWidth}`}>
        <div className="p-2 md:p-4 min-h-screen relative">
          <div className="relative inline-block">
            <div className="flex flex-wrap gap-2 items-center">
              <Tooltip
                content="Mis visitas"
                position="bottom"
                className="bg-gray-200"
              >
                <FaPersonShelter
                  className="flex m-5 cursor-pointer text-cyan-300 hover:text-cyan-200 transition"
                  size={20}
                  onClick={() => setShowVisitors((prev) => !prev)}
                />
              </Tooltip>
              <Buton
                size="sm"
                borderWidth="none"
                className="whitespace-nowrap"
                colVariant="primary"
                onClick={() => handleNavigate("profile", route.myvip)}
                disabled={loading !== null}
              >
                {loading === "profile" ? <ImSpinner9 /> : "Mi perfil"}
              </Buton>

              {(hasRole("owner") || hasRole("tenant")) && (
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="primary"
                  className="whitespace-nowrap"
                  onClick={() =>
                    handleNavigate("market", route.myAdvertisement)
                  }
                  disabled={loading !== null}
                >
                  {loading === "market" ? <ImSpinner9 /> : "Marketplace"}
                </Buton>
              )}

              {hasRole("owner") && (
                <Buton
                  size="sm"
                  borderWidth="none"
                  className="whitespace-nowrap"
                  colVariant="primary"
                  onClick={() => handleNavigate("favorites", route.myfavorites)}
                  disabled={loading !== null}
                >
                  {loading === "favorites" ? <ImSpinner9 /> : "Mis favoritos"}
                </Buton>
              )}

              {(hasRole("owner") || hasRole("tenant")) && (
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="primary"
                  className="whitespace-nowrap"
                  onClick={() => handleNavigate("store", route.myStore)}
                  disabled={loading !== null}
                >
                  {loading === "store" ? <ImSpinner9 /> : "Tienda"}
                </Buton>
              )}

              {hasRole("owner") && (
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="primary"
                  className="whitespace-nowrap"
                  onClick={() => handleNavigate("vacations", route.myvacations)}
                  disabled={loading !== null}
                >
                  {loading === "vacations" ? <ImSpinner9 /> : "Mis vacaciones"}
                </Buton>
              )}

              {hasRole("employee") && (
                <Buton
                  size="sm"
                  borderWidth="none"
                  colVariant="primary"
                  className="whitespace-nowrap"
                  onClick={() => handleNavigate("b2b", "/my-b2b")}
                  disabled={loading !== null}
                >
                  {loading === "b2b" ? <ImSpinner9 /> : "Aliados B2B"}
                </Buton>
              )}

              <Buton
                size="sm"
                borderWidth="none"
                colVariant="primary"
                className="whitespace-nowrap"
                onClick={() => handleNavigate("conjuntos", route.ensemble)}
                disabled={loading !== null}
              >
                {loading === "conjuntos" ? <ImSpinner9 /> : "Mis conjuntos"}
              </Buton>
            </div>

            {showVisitors && (
              <div
                className="
                absolute left-5 top-full mt-1 w-72
                bg-slate-900/60
                backdrop-blur-2xl
                border border-white/10
                rounded-2xl
                shadow-2xl
                z-50
                overflow-hidden
                text-white
                "
                onClick={(e) => e.stopPropagation()}
              >
                <Allvisit />
              </div>
            )}
          </div>
          <div className=" border border-dotted rounded-lg border-cyan-400/20">
            {children}
          </div>
        </div>

        <AlertFlag />
      </div>
      {emergencyAlert && (
        <div className="fixed top-0 left-0 right-0 z-[9998] flex items-center justify-between gap-3 bg-red-600 px-4 py-3 text-white shadow-lg">
          <div>
            <Text size="sm" font="bold">
              {emergencyAlert.title} — {emergencyAlert.customTypeLabel || emergencyAlert.type}
            </Text>
            <Text size="sm">{emergencyAlert.body}</Text>
            {emergencyAlert.evacuationRoute && (
              <Text size="sm">Ruta: {emergencyAlert.evacuationRoute}</Text>
            )}
            {emergencyAlert.meetingPoint && (
              <Text size="sm">Punto de encuentro: {emergencyAlert.meetingPoint}</Text>
            )}
          </div>
          <Button
            colVariant="primary"
            onClick={() => {
              setOpenChat(true);
              setEmergencyAlert(null);
            }}
          >
            Reportar mi estado
          </Button>
        </div>
      )}

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
            {visitImage && (
              <img
                src={visitImage}
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
            <Text as="h2" size="md" font="bold" className="mb-4">
              {currentVisit.status === VisitStatus.PENDING &&
                "🚨 Visitante en portería"}
              {currentVisit.status === VisitStatus.AUTHORIZED &&
                "✅ Visitante autorizado"}
              {currentVisit.status === VisitStatus.INSIDE &&
                "⏱️ Visitante dentro"}
              {currentVisit.status === VisitStatus.DENIED &&
                "❌ Visitante rechazado"}
              {currentVisit.status === VisitStatus.FINISHED &&
                "🚪 Visita finalizada"}
            </Text>

            {/* 📋 INFO */}
            <div className="space-y-2 text-sm">
              <Text size="sm">
                <strong>Nombre:</strong> {currentVisit.namevisit}
              </Text>
              <Text size="sm">
                <strong>Documento:</strong> {currentVisit.numberId}
              </Text>
              <Text size="sm">
                <strong>Apartamento:</strong> {currentVisit.apartment}
              </Text>
              <Text size="sm">
                <strong>Tipo:</strong> {currentVisit.visitType}
              </Text>

              {currentVisit.entryTime && (
                <Text size="sm">
                  <strong>Tiempo:</strong>{" "}
                  <span className="text-blue-600 font-semibold">
                    {formatTime(duration)}
                  </span>
                </Text>
              )}

              {currentVisit.hasParking && (
                <>
                  {currentVisit.plaque && (
                    <Text size="sm">
                      <strong>Placa:</strong> {currentVisit.plaque}
                    </Text>
                  )}
                  <Text size="sm">
                    <strong>Parqueadero:</strong>{" "}
                    {currentVisit.entryTime ? (
                      <span className="text-green-400 font-bold">
                        ${cost.toLocaleString("es-CO")}
                      </span>
                    ) : (
                      <span className="text-green-400 font-bold">
                        $
                        {(currentVisit.parkingRatePerHour || 0).toLocaleString(
                          "es-CO",
                        )}{" "}
                        / hora
                        <span className="ml-1 font-normal text-white/60">
                          (se cobra desde el ingreso)
                        </span>
                      </span>
                    )}
                  </Text>
                </>
              )}
            </div>

            {visitError && (
              <Text size="sm" className="mt-4 rounded-lg bg-red-500/15 px-3 py-2 text-red-300">
                {visitError}
              </Text>
            )}

            {/* 🔘 BOTONES */}
            {currentVisit.status === VisitStatus.PENDING && (
              <div className="flex gap-3 mt-6">
                <Button onClick={() => setIsModalOpen(false)}>Cerrar</Button>

                <Button
                  onClick={() => authorizeVisit(currentVisit.id)}
                  disabled={
                    resolvingVisit || hasRole("employee") || hasRole("porter")
                  }
                  colVariant="success"
                >
                  {resolvingVisit ? "Procesando..." : "Autorizar"}
                </Button>

                <Button
                  onClick={() => denyVisit(currentVisit.id)}
                  disabled={resolvingVisit}
                  colVariant="danger"
                >
                  Rechazar
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
      <div className="fixed top-5 right-20 z-[9999] flex flex-col items-end gap-2">
        <Chatear />
      </div>
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2">
        {/* 👋 Tooltip de entrada (saludo inicial) */}
        {showWelcomeTooltip && !openChat && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white shadow-lg rounded-lg px-3 py-2 text-sm animate-bounce">
            👋 Hola, ¿en qué puedo ayudarte?
          </div>
        )}

        {/* 🖱️ Tooltip hover */}
        <div className="relative group">
          <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block bg-slate-900/80 backdrop-blur-xl border border-white/10 text-white shadow-lg rounded-lg px-3 py-2 text-sm whitespace-nowrap">
            👋 ¿Necesitas ayuda?
          </div>

          {/* 🤖 Chat panel */}
          {openChat && (
            <div className="absolute bottom-full right-0 mb-2 w-[calc(100vw-40px)] sm:w-[380px] max-w-[380px] h-[600px] bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
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

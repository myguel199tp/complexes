/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Buton, Text } from "complexes-next-components";
import { usePathname, useRouter } from "next/navigation";

import {
  FaAdversal,
  FaNewspaper,
  FaStore,
  FaTools,
  FaUmbrellaBeach,
} from "react-icons/fa";

import {
  MdAnnouncement,
  MdDocumentScanner,
  MdHomeWork,
  MdLocalActivity,
  MdPayments,
  MdAutorenew,
  MdWarning,
} from "react-icons/md";

import {
  GiBeachBucket,
  GiDiscussion,
  GiHamburgerMenu,
  GiVote,
} from "react-icons/gi";

import { AiFillMessage } from "react-icons/ai";
import { ImSpinner9 } from "react-icons/im";
import { RiQrScanFill } from "react-icons/ri";

import {
  FaArrowsDownToPeople,
  FaFolderClosed,
  FaMoneyBills,
  FaUsersGear,
} from "react-icons/fa6";

import LogoutPage from "./close";
import { route } from "@/app/_domain/constants/routes";
import { AlertFlag } from "../alertFalg";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSidebarInformation } from "./sidebar-information";
// import { useLanguage, type Language } from "@/app/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { useSidebarQuery } from "./sidebar-query";
import { Sidebarresponse } from "./services/sidebarResponse";
import { useSidebarBadges } from "./use-sidebar-badges";

type SidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

type MenuItem = {
  id: string;
  key: string;
  label: string;
  icon: React.ReactNode;
  route: string;
};

const iconMap: Record<string, React.ComponentType<{ size?: number }>> = {
  FaNewspaper,
  MdLocalActivity,
  MdDocumentScanner,
  FaUsersGear,
  FaMoneyBills,
  MdAutorenew,
  AiFillMessage,
  FaAdversal,
  FaStore,
  RiQrScanFill,
  MdPayments,
  GiVote,
  FaTools,
  FaArrowsDownToPeople,
  FaFolderClosed,
  MdAnnouncement,
  MdHomeWork,
  GiBeachBucket,
  FaUmbrellaBeach,
  GiDiscussion,
  MdWarning,
};

function MarqueeText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden ${className ?? ""}`}>
      <span className="inline-block whitespace-nowrap animate-marquee">
        {text}
      </span>
    </div>
  );
}

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { t } = useTranslation();
  // const { language } = useLanguage();

  // const [showLanguage, setShowLanguage] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const {
    activeSection,
    isPending,
    setActiveSection,
    startTransition,
    valueState,
    isReady,
  } = useSidebarInformation();

  const { userName, userLastName, fileName, userRolName } = valueState;

  const hasRole = (role: string) => userRolName.includes(role);

  const { data } = useSidebarQuery();

  const userRole = useConjuntoStore((state) => state.role);
  const userReside = useConjuntoStore((state) => state.reside);
  const userConjunto = useConjuntoStore((state) => state.conjuntoName);
  const userConcejo = useConjuntoStore((state) => state.concejo);

  const handleNavigate = (key: string, path: string) => {
    setLoading(key);
    router.push(path);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setLoading(null);
    setOpen(false);
  }, [pathname]);

  // const languages: { key: Language; img: string }[] = [
  //   { key: "es", img: "/espanol.jpg" },
  //   { key: "en", img: "/ingles.jpg" },
  //   { key: "pt", img: "/portugues.jpg" },
  // ];

  const menuItems = useMemo<MenuItem[]>(() => {
    if (!data || userRolName.length === 0) {
      return [];
    }

    const iconSize = isCollapsed ? 20 : 10;

    return data
      .filter((item: Sidebarresponse) => {
        // solo activos
        if (!item.isActive) {
          return false;
        }

        // validar rol
        if (item.role !== userRole) {
          return false;
        }

        // ocultar subusuario
        if (item.key === "subusuario" && userReside) {
          return false;
        }

        // ocultar concejo
        if (
          (item.key === "concejo" || item.key === "concejo-owner") &&
          userConcejo
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) => a.order - b.order)
      .map((item: Sidebarresponse) => {
        const IconComponent = iconMap[item.icon];

        return {
          id: item.id,
          key: item.key,
          label: item.label.startsWith("sidebar.") ? t(item.label) : item.label,
          icon: IconComponent ? <IconComponent size={iconSize} /> : null,
          route: item.route,
        };
      });
  }, [
    data,
    isCollapsed,
    t,
    userRole,
    userReside,
    userConcejo,
    userRolName.length,
  ]);

  const menuRoutes = useMemo(() => menuItems.map((i) => i.route), [menuItems]);
  const { pqrUnread, nextPaymentDays } = useSidebarBadges(menuRoutes);

  const paymentDayColor =
    nextPaymentDays !== null
      ? nextPaymentDays <= 3
        ? "bg-red-100 text-red-700"
        : nextPaymentDays <= 7
          ? "bg-yellow-100 text-yellow-700"
          : "bg-green-100 text-green-700"
      : "";

  const profileGradient =
    userRole === "owner"
      ? "bg-gradient-to-br from-green-700 via-green-600 to-emerald-500"
      : userRole === "employee"
        ? "bg-gradient-to-br from-cyan-700 via-cyan-600 to-teal-500"
        : "bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-500";

  const profileRingOffset =
    userRole === "owner"
      ? "ring-offset-green-600"
      : userRole === "employee"
        ? "ring-offset-cyan-600"
        : "ring-offset-blue-600";

  const handleSectionClick = (id: string, path: string) => {
    setActiveSection(id);

    startTransition(() => {
      router.push(path);
    });
  };

  if (!isReady || userRolName.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen z-0">
      {isMobile && !isCollapsed && (
        <div className="absolute inset-0 bg-black/20 z-0 rounded-r-lg"></div>
      )}

      <div className="flex justify-between bg-transparent">
        <GiHamburgerMenu
          size={20}
          className="text-cyan-300 hover:text-cyan-200 cursor-pointer ml-2 z-30 relative transition"
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      <AlertFlag />

      <section
        className={`
          transition-all duration-300 flex flex-col items-center
          rounded-2xl border border-white/10 backdrop-blur-2xl
          shadow-[0_0_30px_rgba(34,211,238,0.1)]
          ${isCollapsed ? "w-[40px]" : "w-[210px]"}
          ${
            isMobile && !isCollapsed
              ? "fixed z-20 h-screen left-0 top-0 w-4/5 bg-slate-950/90"
              : "flex-1 min-h-0 relative bg-white/[0.03]"
          }
          overflow-hidden
        `}
      >
        {!isCollapsed && (
          <>
            {/* User profile card */}
            <div className="w-full relative">
              <div
                className={`w-full ${profileGradient} px-3 pt-3 pb-2 flex flex-col items-center relative overflow-hidden`}
              >
                {/* Decorative blobs */}
                <div className="absolute -top-5 -right-5 w-20 h-20 bg-white/10 rounded-full pointer-events-none" />
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-cyan-900/20 rounded-full pointer-events-none" />

                {/* Business icon */}
                <img
                  src="/icon.png"
                  alt="negocio"
                  className="absolute cursor-pointer top-2 right-2 w-8 h-8 rounded-full object-cover border-2 border-white/60 shadow-md"
                  onClick={() => router.push(route.complexes)}
                />

                {/* Avatar with glow ring */}
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setOpen(!open)}
                >
                  <div
                    className={`ring-[3px] ring-white/70 ring-offset-[3px] ${profileRingOffset} rounded-full shadow-lg shadow-cyan-900/40 transition-transform duration-200 group-hover:scale-105`}
                  >
                    <Avatar
                      src={fileName ?? "/complex.jpg"}
                      alt={`${userName} ${userLastName}`}
                      size="md"
                      border="thick"
                      shape="round"
                    />
                  </div>
                  {/* Online indicator */}
                  <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full shadow-sm" />
                </div>

                {/* Name */}
                <Text font="bold" size="md" colVariant="on" className="mt-2">
                  {userName} {userLastName}
                </Text>

                {/* Conjunto name */}
                {userConjunto &&
                  (hasRole("employee") ||
                    hasRole("owner") ||
                    hasRole("porter")) &&
                  (userRole === "employee" ||
                    userRole === "owner" ||
                    userRole === "porter") && (
                    <div className="mt-1.5 flex items-center gap-1.5 max-w-full">
                      <div className="px-2.5 py-0.5 rounded-full text-sm font-medium bg-white/20 text-white/90 backdrop-blur-sm min-w-0 flex-1">
                        <MarqueeText text={userConjunto} />
                      </div>
                      {hasRole("employee") && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(route.myEmergency);
                          }}
                          title="Emergencias"
                          className="flex-shrink-0 p-1 rounded-full bg-red-500/30 hover:bg-red-500/70 text-red-300 hover:text-white transition-colors"
                        >
                          <MdWarning size={14} />
                        </button>
                      )}
                    </div>
                  )}
              </div>

              {/* Dropdown */}
              {open && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-slate-900/90 backdrop-blur-xl text-white shadow-xl rounded-2xl p-2 w-48 z-50 border border-white/10">
                  <Buton
                    size="sm"
                    borderWidth="none"
                    className="w-full justify-start"
                    onClick={() => handleNavigate("profile", route.myvip)}
                    disabled={loading !== null}
                  >
                    {loading === "profile" ? <ImSpinner9 /> : "Mi perfil"}
                  </Buton>

                  {(hasRole("owner") || hasRole("tenant")) && (
                    <Buton
                      size="sm"
                      borderWidth="none"
                      className="w-full justify-start"
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
                      className="w-full justify-start"
                      onClick={() =>
                        handleNavigate("favorites", route.myfavorites)
                      }
                      disabled={loading !== null}
                    >
                      {loading === "favorites" ? (
                        <ImSpinner9 />
                      ) : (
                        "Mis favoritos"
                      )}
                    </Buton>
                  )}

                  {(hasRole("owner") || hasRole("tenant")) && (
                    <Buton
                      size="sm"
                      borderWidth="none"
                      className="w-full justify-start"
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
                      className="w-full justify-start"
                      onClick={() =>
                        handleNavigate("vacations", route.myvacations)
                      }
                      disabled={loading !== null}
                    >
                      {loading === "vacations" ? (
                        <ImSpinner9 />
                      ) : (
                        "Mis vacaciones"
                      )}
                    </Buton>
                  )}

                  <Buton
                    size="sm"
                    borderWidth="none"
                    className="w-full justify-start"
                    onClick={() => handleNavigate("conjuntos", route.ensemble)}
                    disabled={loading !== null}
                  >
                    {loading === "conjuntos" ? "Cargando..." : "Mis conjuntos"}
                  </Buton>

                  <LogoutPage />
                </div>
              )}
            </div>
          </>
        )}

        <div className="w-full px-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isPqrItem =
              item.route === route.mypqr || item.route === route.myAllPqr;
            const isFeesItem =
              item.route === route.myvip || item.route === route.myfees;

            return (
              <div
                key={item.id}
                onClick={() => handleSectionClick(item.id, item.route)}
                className={`relative flex items-center gap-2 font-bold p-2 mt-0 rounded-lg cursor-pointer transition-colors ${
                  activeSection === item.id
                    ? "bg-cyan-400/15 border border-cyan-400/30 text-cyan-200 shadow-[0_0_15px_rgba(34,211,238,0.15)]"
                    : "text-slate-200 hover:bg-white/5 hover:text-cyan-200"
                }`}
              >
                {item.icon}

                {/* dot indicators when collapsed */}
                {isCollapsed && isPqrItem && pqrUnread > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                )}
                {isCollapsed && isFeesItem && nextPaymentDays !== null && (
                  <span
                    className={`absolute top-1 right-1 w-2 h-2 rounded-full ${
                      nextPaymentDays <= 3
                        ? "bg-red-500"
                        : nextPaymentDays <= 7
                          ? "bg-yellow-400"
                          : "bg-green-400"
                    }`}
                  />
                )}

                {!isCollapsed && <Text size="sm">{item.label}</Text>}

                {/* badges when expanded */}
                {!isCollapsed && isPqrItem && pqrUnread > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full px-1.5 py-0.5 min-w-[18px] text-center leading-none">
                    {pqrUnread}
                  </span>
                )}
                {!isCollapsed && isFeesItem && nextPaymentDays !== null && (
                  <span
                    className={`ml-auto text-xs font-bold rounded px-1.5 py-0.5 leading-none ${paymentDayColor}`}
                  >
                    {nextPaymentDays}d
                  </span>
                )}

                {isPending && activeSection === item.id && (
                  <ImSpinner9 className="animate-spin ml-auto" />
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

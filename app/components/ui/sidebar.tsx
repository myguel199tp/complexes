/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Buton, Text, Tooltip } from "complexes-next-components";
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
import { useLanguage, type Language } from "@/app/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { useSidebarQuery } from "./sidebar-query";
import { Sidebarresponse } from "./services/sidebarResponse";

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
};

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const [showLanguage, setShowLanguage] = useState(false);
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

  const languages: { key: Language; img: string }[] = [
    { key: "es", img: "/espanol.jpg" },
    { key: "en", img: "/ingles.jpg" },
    { key: "pt", img: "/portugues.jpg" },
  ];

  const menuItems = useMemo<MenuItem[]>(() => {
    if (!data || userRolName.length === 0) {
      return [];
    }

    const iconSize = isCollapsed ? 25 : 15;

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
    <div className="flex flex-col h-screen z-0" key={language}>
      {isMobile && !isCollapsed && (
        <div className="absolute inset-0 bg-black/20 z-0 rounded-r-lg"></div>
      )}

      <div className="flex justify-between bg-transparent">
        <GiHamburgerMenu
          size={30}
          className="text-cyan-800 cursor-pointer ml-2 z-30 relative"
          onClick={() => setIsCollapsed(!isCollapsed)}
        />

        <div className="flex items-center gap-3 relative z-40">
          <Tooltip
            content={t("lenguaje")}
            position="bottom"
            className="bg-gray-200"
          >
            <img
              src="/world.png"
              width={isCollapsed ? 20 : 25}
              height={isCollapsed ? 20 : 25}
              className="cursor-pointer"
              onClick={() => setShowLanguage(!showLanguage)}
            />
          </Tooltip>

          {showLanguage && (
            <div className="flex gap-2">
              {languages.map((lng) => (
                <img
                  key={lng.key}
                  src={lng.img}
                  width={30}
                  className="cursor-pointer rounded"
                  onClick={() => {
                    changeLanguage(lng.key);
                    setShowLanguage(false);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertFlag />

      <section
        className={`
          transition-all duration-300 flex flex-col items-center shadow-md shadow-cyan-500/50
          ${isCollapsed ? "w-[70px]" : "w-[230px]"}
          ${
            isMobile && !isCollapsed
              ? "fixed z-20 h-screen left-0 top-0 w-4/5 bg-white"
              : "h-full relative"
          }
          overflow-visible
        `}
      >
        {!isCollapsed && (
          <>
            <Avatar
              src={fileName ?? "/complex.jpg"}
              alt={`${userName} ${userLastName}`}
              size="xl"
              border="thick"
              shape="round"
              className="mt-4 cursor-pointer"
              onClick={() => setOpen(!open)}
            />

            {open && (
              <div className="bg-white shadow-lg rounded-xl p-3 mt-2 w-48">
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
                    {loading === "favorites" ? <ImSpinner9 /> : "Mis favoritos"}
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

            <Text size="sm" font="bold" className="mt-2">
              {userName} {userLastName}
            </Text>

            {userConjunto &&
              (hasRole("employee") || hasRole("owner") || hasRole("porter")) &&
              (userRole === "employee" ||
                userRole === "owner" ||
                userRole === "porter") && (
                <Text size="md" font="bold">
                  {userConjunto}
                </Text>
              )}
          </>
        )}

        <div className="w-full px-2">
          {menuItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSectionClick(item.id, item.route)}
              className={`flex items-center gap-2 font-bold p-2 mt-0 rounded-md cursor-pointer ${
                activeSection === item.id
                  ? "bg-slate-200 text-cyan-800 font-bold"
                  : "text-cyan-800 font-bold"
              }`}
            >
              {item.icon}

              {!isCollapsed && <Text size="sm">{item.label}</Text>}

              {isPending && activeSection === item.id && (
                <ImSpinner9 className="animate-spin ml-auto" />
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

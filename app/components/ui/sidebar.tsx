/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useMemo, useState } from "react";
import { Avatar, Buton, Flag, Text, Tooltip } from "complexes-next-components";
import { useRouter } from "next/navigation";
import {
  FaAdversal,
  FaNewspaper,
  FaStore,
  FaUmbrellaBeach,
} from "react-icons/fa";
import {
  MdAnnouncement,
  MdDocumentScanner,
  MdHomeWork,
  MdLocalActivity,
  MdPayments,
} from "react-icons/md";
import { GiDiscussion, GiHamburgerMenu, GiVote } from "react-icons/gi";
import { AiFillMessage } from "react-icons/ai";
import { ImSpinner9 } from "react-icons/im";
import { RiQrScanFill } from "react-icons/ri";
import { FaFolderClosed, FaUsersGear } from "react-icons/fa6";
import { BsPersonBadgeFill } from "react-icons/bs";

import Chatear from "./citofonie-message/chatear";
import LogoutPage from "./close";
import { route } from "@/app/_domain/constants/routes";
import { AlertFlag } from "../alertFalg";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSidebarInformation } from "./sidebar-information";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useTranslation } from "react-i18next";

type SidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  /* ------------------ estados UI ------------------ */
  const [showLanguage, setShowLanguage] = useState(false);
  const [open, setOpen] = useState(false);

  /* ------------------ sidebar info ------------------ */
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

  const userRole = useConjuntoStore((state) => state.role);
  const userReside = useConjuntoStore((state) => state.reside);
  const userConjunto = useConjuntoStore((state) => state.conjuntoName);
  /* ------------------ acciones del menú avatar ------------------ */
  const profiles = () => router.push(route.myvip);
  const favorites = () => router.push(route.myfavorites);
  const mercado = () => router.push(route.myAdvertisement);
  const vacations = () => router.push(route.myvacations);
  const conjuntos = () => router.push(route.ensemble);

  /* ------------------ menú lateral ------------------ */
  const menuItems = useMemo(() => {
    if (userRolName.length === 0) return [];

    const iconSize = isCollapsed ? 25 : 15;
    const items: {
      id: string;
      label: string;
      icon: React.ReactNode;
      route: string;
    }[] = [];

    if (hasRole("employee") && userRole === "employee") {
      items.push(
        {
          id: "news",
          label: t("sidebar.news"),
          icon: <FaNewspaper size={iconSize} />,
          route: route.mynews,
        },
        {
          id: "activity",
          label: t("sidebar.registerActivity"),
          icon: <MdLocalActivity size={iconSize} />,
          route: route.myactivity,
        },
        {
          id: "register-document",
          label: t("sidebar.registerDocuments"),
          icon: <MdDocumentScanner size={iconSize} />,
          route: route.mycertification,
        },
        {
          id: "citofonia",
          label: t("sidebar.visitor"),
          icon: <AiFillMessage size={iconSize} />,
          route: route.mycitofonia,
        },
        {
          id: "discussion-forum",
          label: t("sidebar.discussionForum"),
          icon: <FaAdversal size={iconSize} />,
          route: route.myforo,
        },
        {
          id: "usuarios",
          label: t("sidebar.registerUsers"),
          icon: <FaUsersGear size={iconSize} />,
          route: route.myuser,
        },
        {
          id: "locales",
          label: "Locales",
          icon: <FaStore size={iconSize} />,
          route: route.mylocals,
        },
        {
          id: "colaboradores",
          label: t("sidebar.registerCollaborato"),
          icon: <BsPersonBadgeFill size={iconSize} />,
          route: route.myworker,
        },
        {
          id: "pqr",
          label: "PQR",
          icon: <RiQrScanFill size={iconSize} />,
          route: route.myAllPqr,
        },
        {
          id: "pagos",
          label: "Pagos",
          icon: <MdPayments size={iconSize} />,
          route: route.payComplexes,
        },
        {
          id: "asamblea",
          label: "Asamblea",
          icon: <GiVote size={iconSize} />,
          route: route.myAssembly,
        }
      );
    }

    if (hasRole("owner") && userRole === "owner") {
      items.push(
        {
          id: "documentos",
          label: t("sidebar.document"),
          icon: <FaFolderClosed size={iconSize} />,
          route: route.mydocuemnts,
        },
        {
          id: "noticias",
          label: t("sidebar.news"),
          icon: <FaNewspaper size={iconSize} />,
          route: route.myprofile,
        },
        {
          id: "area-social",
          label: t("sidebar.socialArea"),
          icon: <MdLocalActivity size={iconSize} />,
          route: route.mysocial,
        },
        {
          id: "crear-anuncio",
          label: t("sidebar.createAd"),
          icon: <MdAnnouncement size={iconSize} />,
          route: route.myadd,
        },
        {
          id: "registrar-inmueble",
          label: t("sidebar.registerProperty"),
          icon: <MdHomeWork size={iconSize} />,
          route: route.mynewimmovable,
        },
        {
          id: "registrar-reserva",
          label: t("sidebar.registerReservation"),
          icon: <FaUmbrellaBeach size={iconSize} />,
          route: route.myholliday,
        },
        {
          id: "pqr",
          label: "PQR",
          icon: <RiQrScanFill size={iconSize} />,
          route: route.mypqr,
        },
        ...(!userReside
          ? [
              {
                id: "subusuario",
                label: "Sub usuario",
                icon: <FaUsersGear size={iconSize} />,
                route: route.mylocatario,
              },
            ]
          : []),
        {
          id: "forum",
          label: "Foro",
          icon: <GiDiscussion size={iconSize} />,
          route: route.myforum,
        },
        {
          id: "asambleas",
          label: "Asambleas",
          icon: <GiVote size={iconSize} />,
          route: route.myConvention,
        }
      );
    }

    if (hasRole("tenant") && userRole === "tenant") {
      items.push(
        {
          id: "noticias",
          label: t("sidebar.news"),
          icon: <FaNewspaper size={iconSize} />,
          route: route.myprofile,
        },
        {
          id: "area-social",
          label: t("sidebar.socialArea"),
          icon: <MdLocalActivity size={iconSize} />,
          route: route.mysocial,
        }
      );
    }

    if (hasRole("porter") && userRole === "porter") {
      items.push(
        {
          id: "noticias",
          label: t("sidebar.news"),
          icon: <FaNewspaper size={iconSize} />,
          route: route.myprofile,
        },
        {
          id: "citofonia",
          label: t("sidebar.visitor"),
          icon: <AiFillMessage size={iconSize} />,
          route: route.mycitofonia,
        }
      );
    }

    if (hasRole("user")) {
      items.push({
        id: "registrar-reserva",
        label: t("sidebar.registerReservation"),
        icon: <FaUmbrellaBeach size={iconSize} />,
        route: route.myholliday,
      });
    }

    return items;
  }, [userRolName.length, isCollapsed, hasRole, t, userReside]);

  const handleSectionClick = (id: string, path: string) => {
    setActiveSection(id);
    startTransition(() => router.push(path));
  };

  if (!isReady || userRolName.length === 0) return null;

  return (
    <>
      <div className="flex flex-col h-screen" key={language}>
        {/* HEADER */}
        <div className="flex justify-between bg-transparent">
          <GiHamburgerMenu
            size={22}
            className="text-cyan-800 cursor-pointer ml-2"
            onClick={() => setIsCollapsed(!isCollapsed)}
          />
          {/* Idiomas */}
          <div className="flex items-center gap-3">
            <Tooltip
              content={t("lenguaje")}
              position="bottom"
              className="bg-gray-200"
            >
              <img
                src="/world.png"
                width={30}
                className="cursor-pointer"
                onClick={() => setShowLanguage(!showLanguage)}
              />
            </Tooltip>

            {showLanguage && (
              <div className="flex gap-2">
                {[
                  { key: "es", img: "/espanol.jpg" },
                  { key: "en", img: "/ingles.jpg" },
                  { key: "pt", img: "/portugues.jpg" },
                ].map((lng) => (
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

          {userConjunto &&
            (hasRole("employee") || hasRole("owner") || hasRole("porter")) &&
            (userRole === "employee" ||
              userRole === "owner" ||
              userRole === "porter") && <Chatear />}
        </div>

        <AlertFlag />

        {/* SIDEBAR */}
        <section
          className={`transition-all duration-300 flex flex-col items-center shadow-md shadow-cyan-500/50 ${
            isCollapsed ? "w-[70px]" : "w-[230px]"
          } h-full overflow-y-auto`}
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
                    onClick={profiles}
                  >
                    Mi perfil
                  </Buton>

                  {(hasRole("owner") || hasRole("tenant")) && (
                    <Buton
                      size="sm"
                      borderWidth="none"
                      className="w-full justify-start"
                      onClick={mercado}
                    >
                      Mi marketplace
                    </Buton>
                  )}

                  {hasRole("owner") && (
                    <Buton
                      size="sm"
                      borderWidth="none"
                      className="w-full justify-start"
                      onClick={favorites}
                    >
                      Mis favoritos
                    </Buton>
                  )}

                  {hasRole("owner") && (
                    <Buton
                      size="sm"
                      borderWidth="none"
                      className="w-full justify-start"
                      onClick={vacations}
                    >
                      Mis vacaciones
                    </Buton>
                  )}

                  <Buton
                    size="sm"
                    borderWidth="none"
                    className="w-full justify-start"
                    onClick={conjuntos}
                  >
                    Mis conjuntos
                  </Buton>

                  <LogoutPage />
                </div>
              )}

              <Text size="xs" font="bold" className="mt-2">
                {userName} {userLastName}
              </Text>

              {userConjunto &&
                (hasRole("employee") ||
                  hasRole("owner") ||
                  hasRole("porter")) &&
                (userRole === "employee" ||
                  userRole === "owner" ||
                  userRole === "porter") && (
                  <Text size="md" font="bold">
                    {userConjunto}
                  </Text>
                )}
            </>
          )}

          {hasRole("owner") && !isCollapsed && (
            <Flag background="warning" className="m-2 p-3">
              <Text size="xs" font="bold">
                ¡Hey! Tienes un pago pendiente.
              </Text>
            </Flag>
          )}

          {/* MENU */}
          <div className="w-full px-2">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSectionClick(item.id, item.route)}
                className={`flex items-center gap-2 p-2 mt-2 rounded-md cursor-pointer ${
                  activeSection === item.id
                    ? "bg-slate-200 text-cyan-800"
                    : "text-cyan-800"
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
    </>
  );
}

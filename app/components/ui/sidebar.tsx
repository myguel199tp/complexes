/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Buton, Flag, Text, Tooltip } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { FaAdversal, FaNewspaper, FaUmbrellaBeach } from "react-icons/fa";
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

import Chatear from "./citofonie-message/chatear";
import LogoutPage from "./close";
import { route } from "@/app/_domain/constants/routes";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { AlertFlag } from "../alertFalg";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSidebarInformation } from "./sidebar-information";
import { useLanguage } from "@/app/hooks/useLanguage";
import { useTranslation } from "react-i18next";
import { BsPersonBadgeFill } from "react-icons/bs";

type SidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const router = useRouter();
  // const payload = getTokenPayload();
  // const userrole = payload?.role || "";
  const conjuntos = () => {
    router.push(route.ensemble);
  };
  const mercado = () => {
    router.push(route.myAdvertisement);
  };
  const profiles = () => {
    router.push(route.myvip);
  };
  const {
    activeSection,
    isPending,
    setActiveSection,
    startTransition,
    valueState,
    isReady,
  } = useSidebarInformation();

  const [userRolName, setUserRolName] = useState<string | null>(null);
  const { t } = useTranslation();
  const [showLanguage, setShowLanguage] = useState(false);
  const { language, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const payload = getTokenPayload();
    setUserRolName(payload?.role || null);
  }, []);

  const menuItems = useMemo(() => {
    if (!userRolName) return [];
    const iconSize = isCollapsed ? 25 : 15;

    const items: Array<{
      id: string;
      label: string;
      icon: React.ReactNode;
      route: string;
    }> = [];

    if (userRolName === "employee") {
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
          id: "citofonia",
          label: t("sidebar.visitor"),
          icon: <AiFillMessage size={iconSize} />,
          route: route.mycitofonia,
        },
        {
          id: "register-document",
          label: t("sidebar.registerDocuments"),
          icon: <MdDocumentScanner size={iconSize} />,
          route: route.mycertification,
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
          id: "Colaboradores",
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

    if (userRolName === "owner") {
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
        {
          id: "subusuario",
          label: "Sub usuario",
          icon: <FaUsersGear size={iconSize} />,
          route: route.mysubuser,
        },
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
          route: route.myallassembly,
        }
      );
    }

    return items;
  }, [userRolName, t, isCollapsed]); // 👈 incluye t en las dependencias

  const handleSectionClick = (id: string, path: string) => {
    setActiveSection(id);
    startTransition(() => router.push(path));
  };
  const userConjunto = useConjuntoStore((state) => state.conjuntoName);

  const { userName, userLastName, fileName } = valueState;
  if (!isReady || !userRolName) return null;
  // const { language, changeLanguage } = useLanguage();

  return (
    <>
      <div className="flex flex-col h-screen" key={language}>
        <div className="flex justify-between bg-transparent">
          <div className="flex items-center pl-2">
            <GiHamburgerMenu
              size={22}
              className="text-cyan-800 cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          </div>
          <div className="flex items-center">
            <Tooltip
              content={t("lenguaje")}
              className="bg-gray-200 w-[100px]"
              position="bottom"
            >
              {!showLanguage && (
                <div
                  className="flex gap-2 items-center cursor-pointer"
                  onClick={() => {
                    setShowLanguage(!showLanguage);
                  }}
                >
                  <img
                    src="/world.png"
                    className="rounded-lg "
                    width={30}
                    height={20}
                    alt="Complexes"
                  />
                </div>
              )}
            </Tooltip>
            {showLanguage && (
              <div className="flex gap-4">
                <Tooltip
                  content={t("español")}
                  className="bg-gray-200 cursor-pointer"
                  position="bottom"
                >
                  <img
                    src="/espanol.jpg"
                    className="rounded-lg cursor-pointer"
                    width={30}
                    height={20}
                    alt={t("español")}
                    onClick={() => {
                      changeLanguage("es");
                      setShowLanguage(!showLanguage);
                    }}
                  />
                </Tooltip>
                <Tooltip
                  content={t("ingles")}
                  className="bg-gray-200"
                  position="bottom"
                >
                  <img
                    src="/ingles.jpg"
                    className="rounded-lg cursor-pointer"
                    width={30}
                    height={20}
                    alt={t("ingles")}
                    onClick={() => {
                      changeLanguage("en");
                      setShowLanguage(false);
                    }}
                  />
                </Tooltip>
                <Tooltip
                  content={t("portugues")}
                  className="bg-gray-200"
                  position="bottom"
                >
                  <img
                    src="/portugues.jpg"
                    className="rounded-lg cursor-pointer"
                    width={30}
                    height={20}
                    alt={t("portugues")}
                    onClick={() => {
                      changeLanguage("pt");
                      setShowLanguage(!showLanguage);
                    }}
                  />
                </Tooltip>
              </div>
            )}
          </div>
          <Chatear />
         
        </div>
        <AlertFlag />
        <section
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className={`transition-all rounded-sm duration-300 flex flex-col items-center shadow-md bg-transparent shadow-cyan-500/50 ${
            isCollapsed ? "w-[70px]" : "w-[230px]"
          } h-full overflow-y-auto custom-scrollbar-hide`}
        >
          {!isCollapsed && fileName && (
            <div className="relative flex flex-col items-center mt-4">
              {/* Avatar */}
              <div
                className="cursor-pointer"
                onClick={() => setOpen((prev) => !prev)}
              >
                <Avatar
                  src={fileName}
                  alt={`${userName} ${userLastName}`}
                  size="xl"
                  border="thick"
                  shape="round"
                />
              </div>

              {/* Menú flotante */}
              {open && (
                <div
                  className="
            absolute top-full mt-2
            bg-white shadow-lg rounded-2xl border border-gray-200
            w-48 p-3 z-50
            animate-fade-in
          "
                >
                  <div className="flex flex-col space-y-2 text-center">
                    <Buton size="sm" borderWidth="none" onClick={profiles}>
                      Mi perfil
                    </Buton>

                    {userRolName === "owner" ? (
                      <Buton size="sm" borderWidth="none" onClick={mercado}>
                        Mi marketplace
                      </Buton>
                    ) : null}

                    {userRolName === "owner" ? (
                      <Buton size="sm" borderWidth="none">
                        Mis vacaciones
                      </Buton>
                    ) : null}

                    <Buton size="sm" borderWidth="none" onClick={conjuntos}>
                      Mis conjuntos
                    </Buton>
                    {userRolName === "owner" ? (
                      <Buton size="sm" borderWidth="none">
                        club complexes{" "}
                      </Buton>
                    ) : null}

                    <LogoutPage />
                  </div>
                </div>
              )}
            </div>
          )}

          {!isCollapsed && (
            <>
              <div className="flex text-center justify-center items-center">
                <Text
                  className="flex items-center mt-2 justify-center"
                  font="bold"
                  size="xs"
                >
                  {`${userName} ${userLastName}`}
                </Text>
              </div>
              {userConjunto && (
                <Text size="xs" font="bold">
                  {userConjunto}
                </Text>
              )}
            </>
          )}

          {userRolName === "owner" && !isCollapsed && (
            <Flag
              background="warning"
              className="mt-1 ml-2 mr-2 p-4"
              rounded="md"
              size="md"
            >
              <Text colVariant="warning" size="xs">
                Faltan 5 días para pagar
              </Text>
              <Text colVariant="danger" size="xs">
                Tienes una mora de 200 días lo que suma un total a pagar de
                300k. Acércate a administración a pagar la deuda.
              </Text>
            </Flag>
          )}

          <div className="w-full flex-col item-center">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 cursor-pointer mt-4 px-2 py-1 rounded-md hover:bg-slate-200 hover:text-cyan-800 ${
                  activeSection === item.id
                    ? "text-cyan-800 bg-slate-200"
                    : "text-cyan-800"
                }`}
                onClick={() => handleSectionClick(item.id, item.route)}
              >
                {item.icon}
                {!isCollapsed && (
                  <Text
                    size="sm"
                    translate="yes"
                    className={`${
                      activeSection === item.id
                        ? "text-cyan-800"
                        : "text-cyan-800"
                    }`}
                  >
                    {item.label}
                  </Text>
                )}
                {isPending && activeSection === item.id && (
                  <ImSpinner9 className="animate-spin ml-auto" />
                )}
              </div>
            ))}
          </div>

          <div className="mt-auto p-2 gap-4 flex items-center justify-between w-full mb-5">
            <Tooltip
              content="COMPLEXES"
              className="bg-gray-300"
              position="right"
            >
              <Buton
                onClick={() => router.push(route.complexes)}
                size="xs"
                borderWidth="none"
                rounded="md"
              >
                <Avatar
                  src="/complex.jpg"
                  alt="complex"
                  size="sm"
                  border="none"
                  shape="rounded"
                />
              </Buton>
            </Tooltip>
          </div>
        </section>
      </div>

      {/* Oculta scrollbar en WebKit */}
      <style jsx>{`
        .custom-scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}

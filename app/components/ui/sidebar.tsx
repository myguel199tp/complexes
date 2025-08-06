"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Avatar, Button, Text } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { FaAdversal, FaNewspaper, FaUmbrellaBeach } from "react-icons/fa";
import { MdAnnouncement, MdHomeWork, MdLocalActivity } from "react-icons/md";
import { GiAllForOne, GiHamburgerMenu } from "react-icons/gi";
import { AiFillMessage } from "react-icons/ai";
import { ImSpinner9 } from "react-icons/im";
import { RiVipDiamondFill } from "react-icons/ri";
import { FaScaleBalanced, FaUsersGear } from "react-icons/fa6";

// import Chatear from "./citofonie-message/chatear";
import LogoutPage from "./close";
import { route } from "@/app/_domain/constants/routes";
import SidebarInformation from "./sidebar-information";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { AlertFlag } from "../alertFalg";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

type SidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const router = useRouter();
  const conjuntos = () => {
    router.push(route.ensemble);
  };
  const {
    activeSection,
    isPending,
    setActiveSection,
    startTransition,
    valueState,
    isReady,
  } = SidebarInformation();

  const [userRolName, setUserRolName] = useState<string | null>(null);

  useEffect(() => {
    const payload = getTokenPayload();
    setUserRolName(payload?.rol || null);
  }, []);

  const menuItems = useMemo(() => {
    if (!userRolName) return [];

    const items: Array<{
      id: string;
      label: string;
      icon: React.ReactNode;
      route: string;
    }> = [];

    if (userRolName === "porteria") {
      items.push(
        {
          id: "Citofonia",
          label: "Citofonia",
          icon: <AiFillMessage size={25} />,
          route: route.mycitofonia,
        },
        {
          id: "news",
          label: "Agregar noticia",
          icon: <FaNewspaper size={25} />,
          route: route.mynews,
        }
      );
    }

    if (userRolName === "useradmin" || userRolName === "arrenadmin") {
      items.push(
        {
          id: "Noticias",
          label: "Noticias",
          icon: <MdLocalActivity size={25} />,
          route: route.myprofile,
        },
        {
          id: "area-social",
          label: "Área social",
          icon: <MdLocalActivity size={25} />,
          route: route.mysocial,
        },
        {
          id: "zona Vip",
          label: "Zona vip",
          icon: <RiVipDiamondFill size={25} />,
          route: route.myvip,
        },
        {
          id: "discussion-forum",
          label: "Foro de discusión",
          icon: <FaAdversal size={25} />,
          route: route.myforo,
        },
        {
          id: "crear-anuncio",
          label: "Crear anuncio",
          icon: <MdAnnouncement size={25} />,
          route: route.myadd,
        },
        {
          id: "Registrar-inmueble",
          label: "Registrar inmueble",
          icon: <MdHomeWork size={25} />,
          route: route.mynewimmovable,
        },
        {
          id: "Registrar-reserva",
          label: "Registrar reserva",
          icon: <FaUmbrellaBeach size={25} />,
          route: route.myholliday,
        }
      );
    }

    if (userRolName === "admins") {
      items.push(
        {
          id: "news",
          label: "Agregar noticia",
          icon: <FaNewspaper size={25} />,
          route: route.mynews,
        },
        {
          id: "activity",
          label: "Registrar Actividad",
          icon: <MdLocalActivity size={25} />,
          route: route.myactivity,
        },
        {
          id: "usuarios",
          label: "Registrar usuarios",
          icon: <FaUsersGear size={25} />,
          route: route.myuser,
        },
        {
          id: "register-document",
          label: "Registro de documentos",
          icon: <FaAdversal size={25} />,
          route: route.mycertification,
        },
        {
          id: "discussion-forum",
          label: "Foro de discusión",
          icon: <GiAllForOne size={25} />,
          route: route.myforo,
        },
        {
          id: "Balance",
          label: "Balance",
          icon: <FaScaleBalanced size={25} />,
          route: route.myuser,
        }
      );
    }

    if (userRolName === "user") {
      items.push(
        {
          id: "crear-anuncio",
          label: "Crear anuncio",
          icon: <FaAdversal size={25} />,
          route: route.myadd,
        },
        {
          id: "crear-inmueble",
          label: "Crear inmueble",
          icon: <MdHomeWork size={25} />,
          route: route.mynewimmovable,
        },
        {
          id: "Registrar-reserva",
          label: "Registrar reserva",
          icon: <FaUmbrellaBeach size={25} />,
          route: route.myholliday,
        },
        {
          id: "zona Vip",
          label: "Zona vip",
          icon: <RiVipDiamondFill size={25} />,
          route: route.myvip,
        }
      );
    }

    return items;
  }, [userRolName]);

  const handleSectionClick = (id: string, path: string) => {
    setActiveSection(id);
    startTransition(() => router.push(path));
  };
  const userConjunto = useConjuntoStore((state) => state.conjuntoName);

  const { userName, userLastName, fileName } = valueState;
  if (!isReady || !userRolName) return null;

  return (
    <>
      <div className="flex flex-col h-screen">
        <AlertFlag />
        <div className="flex justify-between">
          <div className="flex items-center pl-6">
            <GiHamburgerMenu
              size={25}
              className="text-cyan-800 cursor-pointer"
              onClick={() => setIsCollapsed(!isCollapsed)}
            />
          </div>
          {/* <Chatear /> */}
        </div>

        <section
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className={`transition-all rounded-sm duration-300 flex flex-col items-center shadow-md bg-cyan-800 shadow-cyan-500/50 ${
            isCollapsed ? "w-[70px]" : "w-[230px]"
          } h-full overflow-y-auto custom-scrollbar-hide`}
        >
          {!isCollapsed && fileName && (
            <div className="flex justify-center mt-4">
              <Avatar
                src={fileName}
                alt={`${userName} ${userLastName}`}
                size="xl"
                border="thick"
                shape="round"
              />
            </div>
          )}

          {!isCollapsed && (
            <>
              <div className="flex text-center justify-center items-center">
                <Text
                  className="flex text-white items-center mt-2 justify-center"
                  font="bold"
                  size="md"
                >
                  {`${userName} ${userLastName}`}
                </Text>
              </div>
              {userConjunto && (
                <Text size="xs" font="bold" className="text-white">
                  Conjunto {userConjunto}
                </Text>
              )}
            </>
          )}
          {/* 
          {userRolName === "useradmin" && !isCollapsed && (
            <Flag
              background="warning"
              className="mt-1 ml-2 mr-2 p-4"
              rounded="md"
              size="md"
            >
              <Text colVariant="warning" size="sm">
                Faltan 5 días para pagar
              </Text>
              <Text colVariant="danger" size="sm">
                Tienes una mora de 200 días lo que suma un total a pagar de
                300k. Acércate a administración a pagar la deuda.
              </Text>
            </Flag>
          )} */}
          <Button
            size="md"
            rounded="md"
            role="button"
            colVariant="default"
            className="mt-2"
            onClick={conjuntos}
          >
            conjuntos
          </Button>
          <div className="w-full">
            {menuItems.map((item) => (
              <div
                key={item.id}
                className={`flex items-center gap-2 cursor-pointer mt-4 px-2 py-1 rounded-md hover:bg-slate-200 hover:text-cyan-800 ${
                  activeSection === item.id
                    ? "text-cyan-800 bg-slate-200"
                    : "text-white"
                }`}
                onClick={() => handleSectionClick(item.id, item.route)}
              >
                {item.icon}
                {!isCollapsed && (
                  <Text
                    size="sm"
                    className={`${
                      activeSection === item.id ? "text-cyan-800" : "text-white"
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
            {!isCollapsed && <LogoutPage />}
            <Button
              onClick={() => router.push(route.complexes)}
              size="sm"
              rounded="md"
            >
              {!isCollapsed ? "Complexes" : "🏢"}
            </Button>
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

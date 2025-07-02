"use client";

import React, { useMemo } from "react";
import { Avatar, Button, Flag, Text } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { FaAdversal, FaNewspaper, FaUmbrellaBeach } from "react-icons/fa";
import { MdAnnouncement, MdHomeWork, MdLocalActivity } from "react-icons/md";
import { GiAllForOne, GiHamburgerMenu } from "react-icons/gi";
import { AiFillMessage } from "react-icons/ai";
import { ImSpinner9 } from "react-icons/im";
import { RiVipDiamondFill } from "react-icons/ri";

import Chatear from "./citofonie-message/chatear";
import LogoutPage from "./close";
import { route } from "@/app/_domain/constants/routes";
import { FaScaleBalanced, FaUsersGear } from "react-icons/fa6";
import SidebarInformation from "./sidebar-information";

type SidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const router = useRouter();
  const {
    activeSection,
    isPending,
    setActiveSection,
    startTransition,
    valueState,
  } = SidebarInformation();

  const menuItems = useMemo(() => {
    const items = [];

    const { userRolName } = valueState;

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

    if (userRolName === "useradmin") {
      items.push(
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
          icon: <FaNewspaper size={25} />,
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
  }, [valueState.userRolName]);

  const handleSectionClick = (id: string, path: string) => {
    setActiveSection(id);
    startTransition(() => router.push(path));
  };

  const { userName, userLastName, userRolName, fileName } = valueState;

  return (
    <div className="flex flex-col h-screen">
      <Chatear />
      <div className="p-2">
        <GiHamburgerMenu
          size={25}
          className="text-cyan-800 cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </div>
      <section
        className={`transition-all duration-300 flex flex-col items-center shadow-md shadow-cyan-500/50 ${
          isCollapsed ? "w-[70px]" : "w-[230px]"
        } h-full overflow-y-auto`}
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
          <Text className="flex mt-2 justify-center" font="bold" size="md">
            {`${userName} ${userLastName}`}
          </Text>
        )}

        {userRolName === "useradmin" &&
          (!isCollapsed ? (
            <Flag
              background="warning"
              className="mt-2 p-4"
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
          ) : (
            <div
              className="mt-4 cursor-pointer text-yellow-600"
              title="¡Se acerca el día de pago! Faltan 5 días. Tienes una mora de 200 días y debes 300k. Acércate a administración."
            >
              <FaAdversal size={25} />
            </div>
          ))}

        <div className="p-2 mt-1 w-full">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 cursor-pointer mt-4 px-2 py-1 rounded-md hover:bg-slate-200 ${
                activeSection === item.id ? "text-cyan-500" : "text-gray-700"
              }`}
              onClick={() => handleSectionClick(item.id, item.route)}
            >
              {item.icon}
              {!isCollapsed && <Text size="sm">{item.label}</Text>}
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
  );
}

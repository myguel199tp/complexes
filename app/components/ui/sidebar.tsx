"use client";

import { useAuth } from "@/app/middlewares/useAuth";
import { Avatar, Button, Text } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FaAdversal, FaNewspaper, FaUmbrellaBeach } from "react-icons/fa";
import { MdAnnouncement, MdHomeWork } from "react-icons/md";
import { GiAllForOne, GiHamburgerMenu, GiWallet } from "react-icons/gi";
import { AiFillMessage } from "react-icons/ai";
import { CgGames } from "react-icons/cg";
import LogoutPage from "./close";
import { route } from "@/app/_domain/constants/routes";
import { FaScaleBalanced, FaUsersGear } from "react-icons/fa6";
import Chatear from "./citofonie-message/chatear";

type SidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Sidebar({ isCollapsed, setIsCollapsed }: SidebarProps) {
  const router = useRouter();
  const isLoggedIn = useAuth();
  // const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState("crear-anuncio");

  const [userName, setUserName] = useState<string | null>(null);
  const [userLastName, setUserLastName] = useState<string | null>(null);
  const [userRolName, setUserRolName] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (isLoggedIn) {
      setUserName(localStorage.getItem("userName"));
      setUserLastName(localStorage.getItem("userLastName"));
      setUserRolName(localStorage.getItem("rolName"));
      const storedFileName = localStorage.getItem("fileName");
      setFileName(
        storedFileName
          ? `${BASE_URL}/${storedFileName.replace("\\", "/")}`
          : null
      );
    }
  }, [isLoggedIn]);

  const menuItems: {
    id: string;
    label: string;
    icon: JSX.Element;
    route: string;
  }[] = [];

  if (userRolName === "porteria") {
    menuItems.push(
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
    menuItems.push(
      {
        id: "area-social",
        label: "Área social",
        icon: <CgGames size={25} />,
        route: route.mysocial,
      },
      {
        id: "billetera",
        label: "Billetera",
        icon: <GiWallet size={25} />,
        route: route.mywallet,
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
        route: route.mynewadd,
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
    menuItems.push(
      {
        id: "news",
        label: "Agregar noticia",
        icon: <FaNewspaper size={25} />,
        route: route.mynews,
      },
      {
        id: "activity",
        label: "Registrar Actividad",
        icon: <CgGames size={25} />,
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
        route: route.myuser,
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
    menuItems.push(
      {
        id: "crear-anuncio",
        label: "Crear anuncio",
        icon: <FaAdversal size={25} />,
        route: route.mynewadd,
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
      }
    );
  }

  return (
    <div className="flex flex-col h-screen ">
      <div className="p-2">
        <GiHamburgerMenu
          size={25}
          className="text-cyan-800 cursor-pointer"
          onClick={() => setIsCollapsed(!isCollapsed)}
        />
      </div>
      <section
        className={`transition-all duration-300 flex flex-col items-center shadow-md shadow-cyan-500/50 h-auto ${
          isCollapsed ? "w-[70px]" : "w-[230px]"
        }`}
      >
        {!isCollapsed && fileName && (
          <div className="flex justify-center mt-4">
            <Avatar
              src={fileName}
              alt={`${userName || ""} ${userLastName || ""}`}
              size="xl"
              border="thick"
              shape="round"
            />
          </div>
        )}

        {!isCollapsed && (
          <Text className="flex mt-2 justify-center" font="bold" size="md">
            {`${userName || ""} ${userLastName || ""}`}
          </Text>
        )}
        <Chatear />
        <div className="p-2 mt-1">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-2 cursor-pointer mt-4 ${
                activeSection === item.id ? "text-cyan-500" : ""
              }`}
              onClick={() => {
                setActiveSection(item.id);
                router.push(item.route);
              }}
            >
              {item.icon}
              {!isCollapsed && <Text size="sm">{item.label}</Text>}
            </div>
          ))}
        </div>

        <div className="mt-auto p-2 gap-4 flex items-center justify-between">
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

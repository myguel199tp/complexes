"use client";

import { useAuth } from "@/app/middlewares/useAuth";
import { Avatar, Button, Text } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { FaAdversal } from "react-icons/fa";
import { MdHomeWork } from "react-icons/md";
import LogoutPage from "./close";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

export default function Sidebar() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("crear-anuncio");
  const isLoggedIn = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [userLastName, setUserLastName] = useState<string | null>(null);
  const [userRolName, setUserRolName] = useState<string | null>(null);

  const [fileName, setFileName] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (isLoggedIn) {
      const storedUserName = localStorage.getItem("userName");
      const storedUserLastName = localStorage.getItem("userLastName");
      const storedFileName = localStorage.getItem("fileName");
      const storeRolName = localStorage.getItem("rolName");

      setUserName(storedUserName);
      setUserLastName(storedUserLastName);
      setUserRolName(storeRolName);
      setFileName(
        storedFileName
          ? `${BASE_URL}/${storedFileName.replace("\\", "/")}`
          : null
      );
    }
  }, [isLoggedIn]);

  const menuItems = [];

  if (userRolName === "porteria") {
    menuItems.push(
      {
        id: "Citofonia",
        label: "Citofonia",
        icon: <FaAdversal size={20} />,
        route: route.mycitofonia,
      },
      {
        id: "news",
        label: "Agregar noticia",
        icon: <FaAdversal size={20} />,
        route: route.mynews,
      }
    );
  }

  if (userRolName === "useradmin") {
    menuItems.push(
      {
        id: "area-social",
        label: "Area social",
        icon: <FaAdversal size={20} />,
        route: route.mysocial,
      },
      {
        id: "billetera",
        label: "Billetera",
        icon: <FaAdversal size={20} />,
        route: route.mywallet,
      },
      {
        id: "discussion-forum",
        label: "Foro de discución",
        icon: <FaAdversal size={20} />,
        route: route.myforo,
      },
      {
        id: "crear-anuncio",
        label: "Crear anuncio",
        icon: <FaAdversal size={20} />,
        route: route.mynewadd,
      },
      {
        id: "Registrar-inmueble",
        label: "Registrar inmueble",
        icon: <MdHomeWork size={20} />,
        route: route.mynewimmovable,
      },
      {
        id: "Registrar-reserva",
        label: "Registrar reserva",
        icon: <MdHomeWork size={20} />,
        route: route.myholliday,
      }
    );
  }

  if (userRolName === "admins") {
    menuItems.push(
      {
        id: "news",
        label: "Agregar noticia",
        icon: <FaAdversal size={20} />,
        route: route.mynews,
      },
      {
        id: "activity",
        label: "Registrar Actividad",
        icon: <FaAdversal size={20} />,
        route: route.myactivity,
      },
      {
        id: "usuarios",
        label: "Registrar usuarios",
        icon: <FaAdversal size={20} />,
        route: route.myuser,
      },
      {
        id: "register-document",
        label: "Registro de documentos",
        icon: <FaAdversal size={20} />,
        route: route.myuser,
      },
      {
        id: "discussion-forum",
        label: "Foro de discución",
        icon: <FaAdversal size={20} />,
        route: route.myforo,
      },
      {
        id: "Balance",
        label: "Balance",
        icon: <FaAdversal size={20} />,
        route: route.myuser,
      }
    );
  }

  if (userRolName === "user") {
    menuItems.push(
      {
        id: "crear-anuncio",
        label: "Crear anuncio",
        icon: <FaAdversal size={20} />,
        route: route.mynewadd,
      },
      {
        id: "crear-inmueble",
        label: "Crear inmueble",
        icon: <MdHomeWork size={20} />,
        route: route.mynewimmovable,
      }
    );
  }

  return (
    <section className="flex gap-6 w-[280px] h-[620px]">
      <div className="w-full p-2 shadow-md h-full shadow-cyan-500/50 ">
        <div className="flex justify-center">
          {fileName ? (
            <Avatar
              src={fileName}
              alt={`${userName || ""} ${userLastName || ""}`}
              size="xl"
              border="thick"
              shape="round"
            />
          ) : null}
        </div>
        <Text className="flex mt-2 justify-center" font="bold" size="md">
          {`${userName || ""} ${userLastName || ""}`}
        </Text>
        <div className="p-2 mt-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`flex gap-2 cursor-pointer mt-4 items-center ${
                activeSection === item.id ? "text-cyan-500" : ""
              }`}
              onClick={() => {
                setActiveSection(item.id);
                router.push(item.route);
              }}
            >
              {item.icon}
              <Text size="sm">{item.label}</Text>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          <LogoutPage />
          <Button
            onClick={() => {
              router.push(route.complexes);
            }}
            size="sm"
            rounded="md"
          >
            complexes
          </Button>
        </div>
      </div>
    </section>
  );
}

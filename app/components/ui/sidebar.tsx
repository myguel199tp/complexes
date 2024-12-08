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
  const [fileName, setFileName] = useState<string | null>(null);

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    if (isLoggedIn) {
      const storedUserName = localStorage.getItem("userName");
      const storedUserLastName = localStorage.getItem("userLastName");
      const storedFileName = localStorage.getItem("fileName");

      setUserName(storedUserName);
      setUserLastName(storedUserLastName);
      setFileName(
        storedFileName
          ? `${BASE_URL}/${storedFileName.replace("\\", "/")}`
          : null
      );
    }
  }, [isLoggedIn]);

  const menuItems = [
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
    },
    {
      id: "publicaciones-antiguas",
      label: "Publicaciones antiguas",
      icon: <MdHomeWork size={20} />,
      route: route.myantiquity,
    },
    {
      id: "publicaciones-activas",
      label: "Publicaciones activas",
      icon: <MdHomeWork size={20} />,
      route: route.myactivies,
    },
    {
      id: "publicaciones-por-vencer",
      label: "Publicaciones por vencer",
      icon: <MdHomeWork size={20} />,
      route: route.myexpiration,
    },
    {
      id: "chat",
      label: "Chat",
      icon: <FaAdversal size={20} />,
      route: route.mychats,
    },
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
      id: "usuarios",
      label: "Crear usuarios",
      icon: <FaAdversal size={20} />,
      route: route.myuser,
    },
  ];

  return (
    <section className="flex gap-6 w-[350px] h-[620px]">
      {/* Sidebar */}
      <div className="w-full p-2 shadow-md h-full shadow-cyan-500/50">
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
              <Text size="md">{item.label}</Text>
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

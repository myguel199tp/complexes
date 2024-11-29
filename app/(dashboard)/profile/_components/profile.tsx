"use client";
import LogoutPage from "@/app/components/ui/close";
import { useAuth } from "@/app/middlewares/useAuth";
import { Avatar, Text } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { FaAdversal } from "react-icons/fa";
import { MdHomeWork } from "react-icons/md";

export default function Profile() {
  const [activeSection, setActiveSection] = useState("crear-anuncio");
  const isLoggedIn = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [userLastName, setUserLastName] = useState<string | null>(null);
  const menuItems = [
    {
      id: "crear-anuncio",
      label: "Crear anuncio",
      icon: <FaAdversal size={20} />,
      section: (
        <div>
          Este es el contenido de <b>Crear anuncio</b>
        </div>
      ),
    },
    {
      id: "crear-inmueble",
      label: "Crear inmueble",
      icon: <MdHomeWork size={20} />,
      section: (
        <div>
          Este es el contenido de <b>Crear inmueble</b>
        </div>
      ),
    },
    {
      id: "publicaciones-antiguas",
      label: "Publicaciones antiguas",
      icon: <MdHomeWork size={20} />,
      section: (
        <div>
          Este es el contenido de <b>Publicaciones antiguas</b>
        </div>
      ),
    },
    {
      id: "publicaciones-activas",
      label: "Publicaciones activas",
      icon: <MdHomeWork size={20} />,
      section: (
        <div>
          Este es el contenido de <b>Publicaciones activas</b>
        </div>
      ),
    },
    {
      id: "publicaciones-por-vencer",
      label: "Publicaciones por vencer",
      icon: <MdHomeWork size={20} />,
      section: (
        <div>
          Este es el contenido de <b>Publicaciones por vencer</b>
        </div>
      ),
    },
    {
      id: "chat",
      label: "Chat",
      icon: <FaAdversal size={20} />,
      section: <div>muestro el chat</div>,
    },
    {
      id: "area-social",
      label: "Area social",
      icon: <FaAdversal size={20} />,
      section: <div>muestro area social</div>,
    },
    {
      id: "billetera",
      label: "Billetera",
      icon: <FaAdversal size={20} />,
      section: <div>muestro mi billetera</div>,
    },
  ];
  useEffect(() => {
    if (isLoggedIn) {
      setUserName(localStorage.getItem("userName"));
      setUserLastName(localStorage.getItem("userLastName"));
    }
  }, [isLoggedIn]);

  return (
    <section className="flex gap-6 w-full h-[620px]">
      {/* Sidebar */}
      <div className="w-[25%] p-2 shadow-md h-full shadow-cyan-500/50">
        <div className="flex justify-center">
          <Avatar
            src="https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2"
            alt={`${userName} ${userLastName}`}
            size="xl"
            border="thick"
            shape="round"
          />
        </div>
        <Text className="flex mt-2 justify-center" font="bold" size="md">
          {`${userName} ${userLastName}`}
        </Text>
        <div className="p-2 mt-4">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`flex gap-2 cursor-pointer mt-4 items-center ${
                activeSection === item.id ? "text-cyan-500" : ""
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              {item.icon}
              <Text size="md">{item.label}</Text>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <LogoutPage />
        </div>
      </div>

      {/* Content */}
      <div className="w-full">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={activeSection === item.id ? "block" : "hidden"}
          >
            {item.section}
          </div>
        ))}
      </div>
    </section>
  );
}

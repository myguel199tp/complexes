"use client";

import React, { useEffect, useState } from "react";
import { geistMono } from "@/config/fonts";
import Link from "next/link";
import {
  Avatar,
  Buton,
  Button,
  Text,
  Tooltip,
} from "complexes-next-components";
import { FaUser } from "react-icons/fa";
import { useAuth } from "@/app/middlewares/useAuth";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";
import { ImSpinner9 } from "react-icons/im";

export default function TopMenu() {
  const router = useRouter();
  const isLoggedIn = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [userLastName, setUserLastName] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

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

  const handleButtonClick = async (path: string, buttonKey: string) => {
    setActiveButton(buttonKey);
    setLoading(true);

    // Simula un tiempo de carga
    setTimeout(() => {
      setLoading(false);
      router.push(path);
    }, 1000);
  };

  return (
    <nav className="flex px-5 justify-between items-center w-full p-2">
      <div className="w-[15%]">
        <Link href={"/complexes"}>
          <span className={` ${geistMono.variable} antialiased font-bold`}>
            Complexes
          </span>
        </Link>
      </div>

      <div className="hidden sm:block w-[70%] md:!flex justify-center gap-4">
        {[
          { label: "Anuncios", path: route.advertisement },
          { label: "Nosotros", path: route.us },
          { label: "Contacto", path: route.contact },
          { label: "Inmuebles", path: route.immovables },
          { label: "Reservas vacacionales", path: route.holiday },
        ].map(({ label, path }) => (
          <Buton
            key={label}
            size="sm"
            borderWidth="thin"
            rounded="lg"
            colVariant={activeButton === label ? "warning" : "default"}
            onClick={() => handleButtonClick(path, label)}
            className="flex items-center gap-2 hover:bg-slate-400"
          >
            {loading && activeButton === label && <ImSpinner9 />}
            {label}
          </Buton>
        ))}
      </div>

      <div className="flex items-center gap-3 w-[15%]">
        {isLoggedIn ? (
          <Button
            size="md"
            rounded="lg"
            colVariant="warning"
            className="flex items-center gap-2"
            onClick={() => {
              router.push(route.myprofile);
            }}
          >
            {fileName ? (
              <Avatar
                src={fileName}
                alt={`${userName || ""} ${userLastName || ""}`}
                size="md"
                border="thick"
                shape="round"
              />
            ) : null}
            <Text font="bold" size="sm">{`${userName} ${userLastName}`}</Text>
          </Button>
        ) : (
          <div className="flex gap-4 items-center">
            <Link
              href={"/auth"}
              className=" p-1 border-2 border-slate-400 rounded-xl hover:bg-slate-400"
            >
              <Tooltip content="Iniciar sesión" position="left">
                <FaUser size={18} color="gray" />
              </Tooltip>
            </Link>
            <Button
              colVariant="warning"
              size="sm"
              onClick={() => {
                router.push(route.registers);
              }}
            >
              Publica gratis
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

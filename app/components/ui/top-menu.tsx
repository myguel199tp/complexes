"use client";
import React, { useEffect, useState } from "react";
import { geistMono } from "@/config/fonts";
import Link from "next/link";
import { Avatar, Button, Text, Tooltip } from "complexes-next-components";
import { FaUser } from "react-icons/fa";
import { useAuth } from "@/app/middlewares/useAuth";
import { route } from "@/app/_domain/constants/routes";
import { useRouter } from "next/navigation";

export default function TopMenu() {
  const router = useRouter();
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

  return (
    <nav className="flex px-5 justify-between items-center w-full p-2">
      <div>
        <Link href={"/complexes"}>
          <span className={` ${geistMono.variable} antialiased font-bold`}>
            Complexes
          </span>
        </Link>
      </div>

      <div className="hidden sm:block">
        <Link
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-200"
          href={"/advertisements"}
        >
          Anuncios
        </Link>
        <Link
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-200"
          href={"/us"}
        >
          Nosotros
        </Link>
        <Link
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-200"
          href={"/contact"}
        >
          Contacto
        </Link>
        <Link
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-200"
          href={"/immovables"}
        >
          Inmuebles
        </Link>
      </div>

      <div className="flex items-center gap-3">
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
            <Link href={"/auth"}>
              <Tooltip content="Iniciar sesión" position="bottom">
                <FaUser size={25} />
              </Tooltip>
            </Link>
            <Button
              colVariant="warning"
              size="md"
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

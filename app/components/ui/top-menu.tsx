"use client";
import React, { useEffect, useState } from "react";
import { geistMono } from "@/config/fonts";
import Link from "next/link";
import { Avatar, Button, Text, Tooltip } from "complexes-next-components";
import { FaUser } from "react-icons/fa";
import { useAuth } from "@/app/middlewares/useAuth";

export default function TopMenu() {
  const isLoggedIn = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [userLastName, setUserLastName] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      setUserName(localStorage.getItem("userName"));
      setUserLastName(localStorage.getItem("userLastName"));
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
          <Link className="flex items-center gap-2" href={"/profile"}>
            <Avatar
              src="https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2"
              alt={`${userName} ${userLastName}`}
              size="md"
              border="thick"
              shape="round"
            />
            <Text font="bold" size="sm">{`${userName} ${userLastName}`}</Text>
          </Link>
        ) : (
          <div className="flex gap-4 items-center">
            <Link href={"/auth"}>
              <Tooltip content="Iniciar sesión" position="bottom">
                <FaUser size={25} />
              </Tooltip>
            </Link>
            <Button colVariant="warning" size="md">
              <Link href={"/registers"}>Publica gratis</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

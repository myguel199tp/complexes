/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, useTransition } from "react";
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
import { GiHamburgerMenu } from "react-icons/gi";

export default function TopMenu() {
  const router = useRouter();
  const isLoggedIn = useAuth();
  const [userName, setUserName] = useState<string | null>(null);
  const [userLastName, setUserLastName] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeButton, setActiveButton] = useState<string | null>(null);
  const [toogle, setToogle] = useState(false);
  const [isPending, startTransition] = useTransition();

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

  const handleButtonClick = (path: string, buttonKey: string) => {
    setActiveButton(buttonKey);
    startTransition(() => {
      router.push(path);
    });
    setToogle(false);
  };

  return (
    <nav className="flex flex-col md:!flex-row px-1 justify-start md:!justify-between items-start md:!items-center w-full p-1 rounded-md shadow-md">
      <div className="flex">
        <Link href="/complexes">
          <div className="flex gap-2 items-center">
            <img
              src="/complex.jpg"
              className="rounded-lg"
              width={70}
              height={40}
              alt="Complexes"
            />
          </div>
        </Link>
      </div>

      <div className="md:hidden">
        <GiHamburgerMenu
          size={30}
          className="text-cyan-800 cursor-pointer"
          onClick={() => setToogle(!toogle)}
        />
      </div>

      <div
        className={`${
          toogle ? "flex" : "hidden"
        } flex-col mb-2 md:!mb-0 items-start md:!items-center gap-4 md:flex md:flex-row md:gap-4`}
      >
        {[
          { label: "Anuncios", path: route.advertisement },
          { label: "Nosotros", path: route.us },
          { label: "Inmuebles", path: route.immovables },
          { label: "Alquiler", path: route.holiday },
        ].map(({ label, path }) => (
          <Buton
            key={label}
            size="md"
            borderWidth="thin"
            rounded="lg"
            colVariant={activeButton === label ? "warning" : "default"}
            onClick={() => handleButtonClick(path, label)}
            className="flex items-center gap-2 hover:bg-slate-400"
          >
            {isPending && activeButton === label && (
              <ImSpinner9 className="animate-spin text-base" />
            )}
            {label}
          </Buton>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <Button
            size="md"
            rounded="lg"
            colVariant="warning"
            className="flex items-center gap-2"
            onClick={() => handleButtonClick(route.myprofile, "profile")}
            disabled={isPending && activeButton === "profile"} // Desactivar el botón mientras está cargando
          >
            {isPending && activeButton === "profile" ? (
              <ImSpinner9 className="animate-spin text-base" />
            ) : (
              fileName && (
                <Avatar
                  src={fileName}
                  alt={`${userName || ""} ${userLastName || ""}`}
                  size="sm"
                  border="thick"
                  shape="round"
                />
              )
            )}
            <Text font="bold" size="sm">
              {isPending && activeButton === "profile"
                ? "Cargando..."
                : `${userName} ${userLastName}`}
            </Text>
          </Button>
        ) : (
          <div className="flex gap-4 items-center">
            <Link
              href="/auth"
              className="p-1 border-2 border-slate-400 rounded-xl hover:bg-slate-400"
            >
              <Tooltip content="Iniciar sesión" position="left">
                <FaUser size={18} color="gray" />
              </Tooltip>
            </Link>
            <Button
              colVariant="warning"
              size="sm"
              onClick={() => handleButtonClick(route.registers, "register")}
              disabled={isPending && activeButton === "register"} // Desactivar el botón mientras está cargando
            >
              {isPending && activeButton === "register" ? (
                <ImSpinner9 className="animate-spin text-base" />
              ) : (
                "Publica gratis"
              )}
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}

"use client";

import React, { useEffect, useState } from "react";
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
import Image from "next/image";
import { GiHamburgerMenu } from "react-icons/gi";

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
    router.push(path);
    setLoading(false);
  };

  const [toogle, setToogle] = useState(false);

  return (
    <nav className="flex flex-col md:!flex-row px-1 justify-start md:!justify-between items-start md:!items-center w-full p-1 rounded-md shadow-md">
      <div className="flex">
        <Link href={"/complexes"}>
          <div className="flex gap-2 items-center">
            <Image
              className="rounded-lg"
              width={70}
              height={40}
              alt="Complexes"
              src={"/complex.jpg"}
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
          { label: "Contacto", path: route.contact },
          { label: "Inmuebles", path: route.immovables },
          { label: "Alquiler", path: route.holiday },
        ].map(({ label, path }) => (
          <Buton
            key={label}
            size="md"
            borderWidth="thin"
            rounded="lg"
            colVariant={activeButton === label ? "warning" : "default"}
            onClick={() => {
              handleButtonClick(path, label);
              setToogle(false); // opcional: cerrar menú en móviles
            }}
            className="flex items-center gap-2 hover:bg-slate-400"
          >
            {loading && activeButton === label && <ImSpinner9 />}
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

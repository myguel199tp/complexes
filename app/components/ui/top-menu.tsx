"use client";
import React from "react";
import { geistMono } from "@/config/fonts";
import Link from "next/link";
import { Button } from "complexes-next-components";
import { FaUser } from "react-icons/fa";

export default function TopMenu() {
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
        <Link href={"/users"}>
          <FaUser size={20} />
        </Link>

        <Button colVariant="warning" size="md">
          <Link href={"/registers"}>Publica gratis</Link>
        </Button>
      </div>
    </nav>
  );
}

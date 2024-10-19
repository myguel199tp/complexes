"use client";
import React from "react";
import { geistMono } from "@/config/fonts";
import Link from "next/link";

export default function TopMenu() {
  return (
    <nav className="flex px-5 justify-between items-center w-full">
      <div>
        <Link href={"/complexes"}>
          <span className={` ${geistMono.variable} antialiased font-bold`}>
            Complexes
          </span>
        </Link>
      </div>

      <div className="hidden sm:block">
        <Link
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-400"
          href={"/advertisements"}
        >
          Anuncios
        </Link>
        <Link
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-400"
          href={"/us"}
        >
          Nosotros
        </Link>
        <Link
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-400"
          href={"/contact"}
        >
          Contacto
        </Link>
        <Link
          className="m-2 p-2 rounded-md transition-all hover:bg-gray-400"
          href={"/immovables"}
        >
          Inmuebles
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <button className="bg-yellow-500 rounded-md p-2 text-white font-thin mt-2">
          Publica gratis
        </button>
      </div>
    </nav>
  );
}

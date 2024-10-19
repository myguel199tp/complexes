"use client";
import React from "react";
import { clsx } from "clsx";
import {
  IoCloseOutline,
  IoLogInOutline,
  IoLogOutOutline,
  IoPeopleOutline,
  IoPersonAddOutline,
  IoSearchOutline,
  IoShirtOutline,
  IoTicketOutline,
} from "react-icons/io5";
import Link from "next/link";
import { useUiStore } from "./ui-store";

export default function Sidebar() {
  const isSideMenuOpen = useUiStore((state) => state.isSideMenuOpen);
  const closeMenu = useUiStore((state) => state.closeSideMenu);
  return (
    <div>
      {isSideMenuOpen && (
        <div className="fixed top-0 w-screen h-screen z-10 bg-black opacity-30" />
      )}
      {isSideMenuOpen && (
        <div className="fade-in fidex top-0 left-0 z-10 backdrop-filter backdrop-blur-sm" />
      )}
      <nav
        className={clsx(
          "fixed p-5 right-0 top-0 w-[500px] h-screen bg-white z-20 shadow-2xl transform transition-all duration-300 rounded-md",
          { "translate-x-full": !isSideMenuOpen }
        )}
      >
        <IoCloseOutline
          size={20}
          className="absolute top-5 right-5 cursor-pointer"
          onClick={() => closeMenu()}
        />
        <div className="relative mt-6">
          <IoSearchOutline className="absolute top-2 left-2" />
          <input
            type="text"
            placeholder="Buscar"
            className="w-full bg-gray-300 rounded pl-10 py-1 pr-10 border-b-2 text-xl border-gray-200 focus:outline-none focus:border-blue-500 shadow-md"
          />
        </div>

        <Link
          href={"/"}
          className="flex items-center gap-3 mt-2 p-2 hover:bg-gray-100 rounded transition-all"
        >
          <IoPersonAddOutline size={20} />
          <span className="text-xl">Perfil</span>
        </Link>
        <Link
          href={"/"}
          className="flex items-center gap-3 mt-2 p-2 hover:bg-gray-100 rounded transition-all"
        >
          <IoTicketOutline size={20} />
          <span className="text-xl">Ordenes</span>
        </Link>
        <Link
          href={"/"}
          className="flex items-center gap-3 mt-2 p-2 hover:bg-gray-100 rounded transition-all"
        >
          <IoLogInOutline size={20} />
          <span className="text-xl">Ingresar</span>
        </Link>
        <Link
          href={"/"}
          className="flex items-center gap-3 mt-2 p-2 hover:bg-gray-100 rounded transition-all"
        >
          <IoLogOutOutline size={20} />
          <span className="text-xl">Cerrar Sesión</span>
        </Link>
        <div className="w-full h-px bg-gray-200 my-10">
          <Link
            href={"/"}
            className="flex items-center gap-3 mt-2 p-2 hover:bg-gray-100 rounded transition-all"
          >
            <IoShirtOutline size={20} />
            <span className="text-xl">Productos</span>
          </Link>
          <Link
            href={"/"}
            className="flex items-center gap-3 mt-2 p-2 hover:bg-gray-100 rounded transition-all"
          >
            <IoTicketOutline size={20} />
            <span className="text-xl">Ordenes</span>
          </Link>
          <Link
            href={"/"}
            className="flex items-center gap-3 mt-2 p-2 hover:bg-gray-100 rounded transition-all"
          >
            <IoPeopleOutline size={20} />
            <span className="text-xl">Usuaios</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}

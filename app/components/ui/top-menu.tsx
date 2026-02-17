/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

// import React, { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Avatar,
  Buton,
  Button,
  Text,
  Tooltip,
} from "complexes-next-components";
import { FaUser } from "react-icons/fa";
import { route } from "@/app/_domain/constants/routes";
import { ImSpinner9 } from "react-icons/im";
import { GiHamburgerMenu } from "react-icons/gi";
import Topinformation from "./top-information";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";
import VoiceCommands from "./voiceCommand";
import { FaClipboardQuestion } from "react-icons/fa6";
import ModalFAQ from "./modal/modal";

export default function TopMenu() {
  const {
    valueState,
    isPending,
    toogle,
    isLoggedIn,
    setToogle,
    setValueState,
    startTransition,
  } = Topinformation();
  const router = useRouter();

  const handleButtonClick = (path: string, buttonKey: string) => {
    setValueState((prev) => ({ ...prev, activeButton: buttonKey }));
    startTransition(() => {
      router.push(path);
    });
    setToogle(false);
  };

  const [showLanguage, setShowLanguage] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const { language, changeLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <nav
      key={language}
      className="flex flex-col md:!flex-row px-1 justify-start md:!justify-between items-start md:!items-center w-full p-1 rounded-md shadow-md"
    >
      <div className="flex items-center gap-4">
        <VoiceCommands />
        <Tooltip
          content={t("inicio")}
          position="bottom"
          className="bg-gray-200"
        >
          <Link href="/complexes">
            <div className="flex gap-2 items-center">
              <img
                src="/complex.jpg"
                className="rounded-lg"
                width={70}
                height={40}
                alt={t("inicio")}
              />
            </div>
          </Link>
        </Tooltip>
        <Tooltip
          content={t("lenguaje")}
          className="bg-gray-200 w-[100px]"
          position="bottom"
        >
          {!showLanguage && (
            <div
              className="flex gap-2 items-center cursor-pointer"
              onClick={() => {
                setShowLanguage(!showLanguage);
              }}
            >
              <img
                src="/world.png"
                className="rounded-lg "
                width={20}
                height={20}
                alt="Complexesph"
              />
            </div>
          )}
        </Tooltip>
        {showLanguage && (
          <div className="flex gap-4">
            <Tooltip
              content={t("español")}
              className="bg-gray-200 cursor-pointer"
              position="bottom"
            >
              <img
                src="/espanol.jpg"
                className="rounded-lg cursor-pointer"
                width={30}
                height={20}
                alt={t("español")}
                onClick={() => {
                  changeLanguage("es");
                  setShowLanguage(!showLanguage);
                }}
              />
            </Tooltip>
            <Tooltip
              content={t("ingles")}
              className="bg-gray-200"
              position="bottom"
            >
              <img
                src="/ingles.jpg"
                className="rounded-lg cursor-pointer"
                width={30}
                height={20}
                alt={t("ingles")}
                onClick={() => {
                  changeLanguage("en");
                  setShowLanguage(false);
                }}
              />
            </Tooltip>
            <Tooltip
              content={t("portugues")}
              className="bg-gray-200"
              position="bottom"
            >
              <img
                src="/portugues.jpg"
                className="rounded-lg cursor-pointer"
                width={30}
                height={20}
                alt={t("portugues")}
                onClick={() => {
                  changeLanguage("pt");
                  setShowLanguage(!showLanguage);
                }}
              />
            </Tooltip>
          </div>
        )}
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
          { label: t("anuncios"), key: "anuncios", path: route.advertisement },
          { label: t("servicios"), key: "servicios", path: route.us },
          { label: t("inmuebles"), key: "inmuebles", path: route.immovables },
          { label: t("alquiler"), key: "alquiler", path: route.holiday },
        ].map(({ label, key, path }) => (
          <Buton
            key={key}
            size="md"
            borderWidth="none"
            rounded="lg"
            colVariant={valueState.activeButton === key ? "warning" : "default"}
            onClick={() => handleButtonClick(path, key)}
            className="flex items-center gap-2 hover:bg-slate-200"
          >
            {isPending && valueState.activeButton === key && (
              <ImSpinner9 className="animate-spin text-base" />
            )}
            {label}
          </Buton>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <Buton
            size="md"
            rounded="lg"
            borderWidth="none"
            colVariant="warning"
            className="flex items-center gap-2"
            onClick={() => handleButtonClick(route.ensemble, "profile")}
            disabled={isPending && valueState.activeButton === "profile"}
          >
            {isPending && valueState.activeButton === "profile" ? (
              <ImSpinner9 className="animate-spin text-base" />
            ) : (
              valueState.fileName && (
                <Avatar
                  src={valueState.fileName}
                  alt={`${valueState.userName} ${valueState.userLastName}`}
                  size="sm"
                  border="thick"
                  shape="round"
                />
              )
            )}
            <Text font="bold" size="sm">
              {isPending && valueState.activeButton === "profile" ? (
                <ImSpinner9 className="animate-spin text-base" />
              ) : (
                `${valueState.userName} ${valueState.userLastName}`
              )}
            </Text>
          </Buton>
        ) : (
          <div className="flex gap-4 items-center">
            <Tooltip
              content="Preguntas frecuentes"
              className="bg-gray-200 "
              position="bottom"
            >
              <FaClipboardQuestion
                size={20}
                color="gray"
                onClick={() => {
                  setShowInfo(true);
                }}
                className="cursor-pointer"
              />
            </Tooltip>
            <Link
              href="/auth"
              className="p-1 border-2 border-slate-400 rounded-xl hover:bg-slate-400"
            >
              <Tooltip
                content={t("sesion")}
                className="bg-gray-200"
                position="bottom"
              >
                <FaUser size={18} color="gray" />
              </Tooltip>
            </Link>

            <Button
              tKey={t("registrarme")}
              colVariant="warning"
              size="sm"
              onClick={() => handleButtonClick(route.registers, "register")}
              disabled={isPending && valueState.activeButton === "register"}
            >
              {isPending && valueState.activeButton === "register" ? (
                <ImSpinner9 className="animate-spin text-base" />
              ) : (
                "Registrarme gratis"
              )}
            </Button>
          </div>
        )}
      </div>

      {showInfo && (
        <ModalFAQ
          isOpen
          onClose={() => {
            setShowInfo(false);
          }}
        />
      )}
    </nav>
  );
}

/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Avatar, Buton, Text, Tooltip } from "complexes-next-components";
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
      className="w-full px-4 py-3 bg-white shadow-md rounded-md"
    >
      {/* CONTENEDOR PRINCIPAL */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-4">
        {/* IZQUIERDA (logo + links) */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
          {/* TOP ROW (logo + idioma + hamburger) */}
          <div className="flex items-center justify-between w-full md:w-auto gap-3">
            <div className="flex items-center gap-3">
              <VoiceCommands />

              <Link href="/complexes">
                <img
                  src="/complex.jpg"
                  className="rounded-lg"
                  width={60}
                  height={40}
                  alt={t("inicio")}
                />
              </Link>

              <div className="relative">
                <img
                  src="/world.png"
                  width={20}
                  height={20}
                  className="cursor-pointer"
                  onClick={() => setShowLanguage(!showLanguage)}
                />

                {showLanguage && (
                  <div className="absolute top-8 left-0 bg-white shadow-lg p-2 rounded-lg flex gap-2 z-50 w-14 border">
                    <img
                      src="/espanol.jpg"
                      width={70}
                      className="cursor-pointer rounded"
                      onClick={() => {
                        changeLanguage("es");
                        setShowLanguage(false);
                      }}
                    />
                    <img
                      src="/ingles.jpg"
                      width={70}
                      className="cursor-pointer rounded"
                      onClick={() => {
                        changeLanguage("en");
                        setShowLanguage(false);
                      }}
                    />
                    <img
                      src="/portugues.jpg"
                      width={70}
                      className="cursor-pointer rounded"
                      onClick={() => {
                        changeLanguage("pt");
                        setShowLanguage(false);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* HAMBURGER SOLO MOBILE */}
            <div className="md:hidden">
              <GiHamburgerMenu
                size={28}
                className="text-cyan-800 cursor-pointer"
                onClick={() => setToogle(!toogle)}
              />
            </div>
          </div>

          {/* MENU LINKS */}
          <div
            className={`
              ${toogle ? "flex" : "hidden"}
              flex-col w-full gap-3
              md:flex md:flex-row md:w-auto md:gap-4
            `}
          >
            {[
              {
                label: t("anuncios"),
                key: "anuncios",
                path: route.advertisement,
              },
              { label: t("servicios"), key: "servicios", path: route.us },
              {
                label: t("inmuebles"),
                key: "inmuebles",
                path: route.immovables,
              },
              { label: t("alquiler"), key: "alquiler", path: route.holiday },
            ].map(({ label, key, path }) => (
              <Buton
                key={key}
                size="md"
                borderWidth="none"
                rounded="lg"
                colVariant={
                  valueState.activeButton === key ? "warning" : "default"
                }
                onClick={() => handleButtonClick(path, key)}
                className="flex items-center gap-2 hover:bg-slate-200 w-full md:w-auto justify-start md:justify-center"
              >
                {isPending && valueState.activeButton === key && (
                  <ImSpinner9 className="animate-spin text-base" />
                )}
                {label}
              </Buton>
            ))}
          </div>
        </div>

        {/* DERECHA (login / profile) */}
        <div className="flex items-center gap-4">
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
                {`${valueState.userName} ${valueState.userLastName}`}
              </Text>
            </Buton>
          ) : (
            <>
              <Tooltip
                content="Preguntas frecuentes"
                className="bg-gray-200"
                position="bottom"
              >
                <FaClipboardQuestion
                  size={20}
                  color="gray"
                  onClick={() => setShowInfo(true)}
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
            </>
          )}
        </div>
      </div>

      {/* MODAL */}
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

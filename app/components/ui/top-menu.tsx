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

  const menuItems = [
    { label: t("anuncios"), key: "anuncios", path: route.advertisement },
    { label: t("servicios"), key: "servicios", path: route.us },
    { label: t("inmuebles"), key: "inmuebles", path: route.immovables },
    { label: t("conocenos"), key: "conocenos", path: route.about },
    { label: t("noticias"), key: "blog", path: route.blogs },
  ];

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-7xl flex items-center gap-4 px-4">
        <Link href="/complexes" className="flex items-center">
          <Avatar
            src="/complex.jpg"
            alt={"SmarPH"}
            size="xl"
            border="none"
            shape="round"
          />
        </Link>
        <nav
          key={language}
          className="
          w-full
          px-4 py-3
          rounded-full
          m-4
          text-sm
          bg-white/10
          backdrop-blur-2xl
          border border-white/20
          shadow-lg
          sticky top-4 z-50
        "
        >
          <div className="flex items-center justify-between w-full gap-6">
            {" "}
            {/* izquierda */}
            <div className="flex items-center gap-3">
              <VoiceCommands />

              {/* selector idioma */}
              <div className="relative">
                <img
                  src="/world.png"
                  width={20}
                  height={20}
                  className="cursor-pointer"
                  onClick={() => setShowLanguage(!showLanguage)}
                />

                {showLanguage && (
                  <div className="absolute top-8 left-0 bg-white shadow-lg p-2 rounded-lg flex gap-2 z-50 border">
                    <img
                      src="/espanol.jpg"
                      width={30}
                      className="cursor-pointer rounded"
                      onClick={() => {
                        changeLanguage("es");
                        setShowLanguage(false);
                      }}
                    />
                    <img
                      src="/ingles.jpg"
                      width={30}
                      className="cursor-pointer rounded"
                      onClick={() => {
                        changeLanguage("en");
                        setShowLanguage(false);
                      }}
                    />
                    <img
                      src="/portugues.jpg"
                      width={30}
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
            {/* menú desktop */}
            <div className="hidden md:flex items-center gap-4">
              {menuItems.map(({ label, key, path }) => (
                <Buton
                  key={key}
                  size="md"
                  borderWidth="none"
                  rounded="lg"
                  colVariant={
                    valueState.activeButton === key ? "success" : "default"
                  }
                  onClick={() => handleButtonClick(path, key)}
                  className="
                    flex items-center gap-2 
                    px-3 py-1.5
                    hover:bg-white/20
                    transition-all duration-200
                  "
                >
                  {isPending && valueState.activeButton === key && (
                    <ImSpinner9 className="animate-spin text-base" />
                  )}
                  {label}
                </Buton>
              ))}
            </div>
            {/* derecha */}
            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <Buton
                  size="md"
                  rounded="lg"
                  borderWidth="none"
                  colVariant="success"
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

              {/* hamburguesa mobile */}
              <div className="md:hidden">
                <GiHamburgerMenu
                  size={28}
                  className="text-cyan-800 cursor-pointer"
                  onClick={() => setToogle(!toogle)}
                />
              </div>
            </div>
          </div>

          {/* menú mobile */}
          <div
            className={`
          ${toogle ? "flex" : "hidden"}
          flex-col gap-2 px-4 pb-3
          md:hidden
          transition-all duration-300
        `}
          >
            {menuItems.map(({ label, key, path }) => (
              <Buton
                key={key}
                size="md"
                borderWidth="none"
                rounded="lg"
                colVariant={
                  valueState.activeButton === key ? "success" : "default"
                }
                onClick={() => handleButtonClick(path, key)}
                className="flex justify-start w-full hover:bg-slate-200"
              >
                {isPending && valueState.activeButton === key && (
                  <ImSpinner9 className="animate-spin text-base" />
                )}
                {label}
              </Buton>
            ))}
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
      </div>
    </div>
  );
}

/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { Avatar, Buton, Text } from "complexes-next-components";
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
// import { FaClipboardQuestion } from "react-icons/fa6";
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

  // const [showLanguage, setShowLanguage] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const { language } = useLanguage();
  const { t } = useTranslation();

  const menuItems = [
    { label: t("aliados"), key: "aliados", path: route.advertisement },
    { label: t("servicios"), key: "servicios", path: route.us },
    { label: t("inmuebles"), key: "inmuebles", path: route.immovables },
    { label: t("conocenos"), key: "conocenos", path: route.about },
    { label: t("noticias"), key: "blog", path: route.blogs },
  ];

  // Se renderiza en la barra superior en desktop y dentro del desplegable en mobile
  const authSection = isLoggedIn ? (
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
    <Link
      href="/auth"
      aria-label={t("sesion")}
      onClick={() => setToogle(false)}
      className="
        w-full md:w-auto
        flex items-center justify-center gap-2
        px-5 py-2.5
        rounded-xl
        bg-gradient-to-r from-cyan-700 to-cyan-500
        text-white shadow-md ring-1 ring-cyan-800/20
        hover:from-cyan-800 hover:to-cyan-600 hover:shadow-lg hover:-translate-y-0.5
        focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2
        active:translate-y-0
        transition-all duration-200
      "
    >
      <FaUser size={16} />
      <Text font="bold" size="sm" className="text-white whitespace-nowrap">
        Iniciar Sesión
      </Text>
    </Link>
  );

  return (
    <div className="w-full flex justify-center bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <nav key={language} className="w-full max-w-7xl px-4 py-3 text-sm">
        <div className="flex items-center justify-between w-full gap-6">
          {/* logo */}
          <Link href="/complexes" className="flex items-center shrink-0">
            <img src="/complex.png" alt={"SmarPH"} className="h-12 w-auto" />
          </Link>{" "}
          {/* izquierda */}
          <div className="flex items-center gap-3">
            <VoiceCommands />

            {/* selector idioma */}
            {/* <div className="relative">
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
              </div> */}
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
                    hover:bg-gray-100
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
            {/* en mobile se muestra al final del desplegable */}
            <div className="hidden md:flex items-center gap-4">
              {authSection}
            </div>

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

          <div className="mt-2 pt-3 border-t border-gray-200">
            {authSection}
          </div>
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
  );
}

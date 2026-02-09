"use client";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { route } from "@/app/_domain/constants/routes";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useLanguage } from "@/app/hooks/useLanguage";
import { Buton } from "complexes-next-components";
import { useRouter, usePathname } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { ImSpinner9 } from "react-icons/im";

export default function MenuTop() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();
  const { language } = useLanguage();

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 200; // pixeles que se desplaza
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };
  const handleClick = (path: string) => {
    setLoading(path); // activa spinner
    router.push(path);
  };

  useEffect(() => {
    const payload = getTokenPayload();
    setUserRoles(payload?.roles || []);
  }, []);

  // 🔥 Cuando cambia la URL, quitamos el spinner
  useEffect(() => {
    setLoading(null);
  }, [pathname]);

  // Helper para reutilizar botones
  const renderButton = (label: string, path: string) => (
    <Buton
      colVariant={pathname === path ? "warning" : "primary"}
      borderWidth="none"
      size="sm"
      rounded="lg"
      onClick={() => handleClick(path)}
    >
      {loading === path ? (
        <ImSpinner9 className="animate-spin text-lg" />
      ) : (
        label
      )}
    </Buton>
  );

  const hasRole = (role: string) => userRoles.includes(role);
  const userRole = useConjuntoStore((state) => state.role);

  return (
    <div key={language}>
      {hasRole("employee") && userRole === "employee" && (
        <div className="relative w-full flex items-center mt-2">
          {/* Botón izquierda */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200"
          >
            <FaChevronLeft />
          </button>

          {/* Contenedor scrollable */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto scrollbar-hide w-full px-10"
          >
            {renderButton(t("newregisters"), route.news)}
            {renderButton(t("activityRegister"), route.activity)}
            {renderButton(t("visitRegister"), route.citofonia)}
            {renderButton(t("docRegister"), route.certification)}
            {renderButton(t("forRegister"), route.foro)}
            {renderButton(t("usRegister"), route.user)}
            {/* {renderButton(t("usRegister"), route.worker)} */}
            {renderButton(t("asamb"), route.myConvention)}
            {renderButton(t("mantenREgister"), route.maintenaceResult)}
            {renderButton(t("areasREgister"), route.areaMaintenaceResult)}
            {renderButton(t("provedRegister"), route.areaProveedorResult)}
          </div>

          {/* Botón derecha */}
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200"
          >
            <FaChevronRight />
          </button>
        </div>
      )}
      {hasRole("owner") && userRole === "owner" && (
        <div className="flex gap-3 w-full justify-center items-center mt-2 flex-wrap">
          {renderButton(t("anounceRegister"), route.add)}
          {renderButton(t("inmueblesRegister"), route.immovable)}
          {renderButton(t("reservasRegister"), route.vacations)}
          {renderButton(t("pqrRegister"), route.pqr)}
        </div>
      )}
    </div>
  );
}

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
      const scrollAmount = 300;

      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const handleClick = (path: string) => {
    setLoading(path);
    router.push(path);
  };

  useEffect(() => {
    const payload = getTokenPayload();
    setUserRoles(payload?.roles || []);
  }, []);

  useEffect(() => {
    setLoading(null);
  }, [pathname]);

  const renderButton = (label: string, path: string) => (
    <Buton
      colVariant={pathname === path ? "warning" : "primary"}
      borderWidth="none"
      size="md"
      rounded="lg"
      className="px-6 py-2 whitespace-nowrap text-sm font-semibold"
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
    <div className="w-full overflow-hidden" key={language}>
      <div className="w-full max-w-[1400px] mx-auto">
        {hasRole("employee") && userRole === "employee" && (
          <div className="relative flex items-center py-2 w-full overflow-hidden">
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 z-30 bg-white p-3 rounded-full shadow-lg hover:bg-gray-200 transition"
            >
              <FaChevronLeft />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto scroll-smooth w-full px-14 scrollbar-hide min-w-0"
            >
              {renderButton(t("usRegister"), route.user)}
              {renderButton(t("mynoticia"), route.news)}
              {renderButton("Agregar actividad", route.activity)}
              {renderButton(t("visitRegister"), route.citofonia)}
              {renderButton(t("registroDocuemnto"), route.certification)}
              {renderButton(t("agregarForo"), route.myforo)}
              {renderButton(t("asamb"), route.myConvention)}
              {renderButton(t("mantenREgister"), route.maintenaceResult)}
              {renderButton(t("areasREgister"), route.areaMaintenaceResult)}
              {renderButton(t("provedRegister"), route.areaProveedorResult)}
            </div>

            <button
              onClick={() => scroll("right")}
              className="absolute right-2 z-30 bg-white p-3 rounded-full shadow-lg hover:bg-gray-200 transition"
            >
              <FaChevronRight />
            </button>

            <div className="absolute right-0 top-0 h-full w-16 bg-gradient-to-l to-transparent pointer-events-none" />

            <div className="absolute left-0 top-0 h-full w-16 bg-gradient-to-r  to-transparent pointer-events-none" />
          </div>
        )}

        {hasRole("owner") && userRole === "owner" && (
          <div className="flex gap-4 w-full justify-center items-center mt-4 flex-wrap pb-4">
            {renderButton(t("anounceRegister"), route.add)}
            {renderButton(t("inmueblesRegister"), route.immovable)}
            {renderButton(t("reservasRegister"), route.vacations)}
            {renderButton(t("pqrRegister"), route.pqr)}
          </div>
        )}
      </div>
    </div>
  );
}

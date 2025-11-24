"use client";

import { route } from "@/app/_domain/constants/routes";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { Buton } from "complexes-next-components";
import { useRouter, usePathname } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ImSpinner9 } from "react-icons/im";

export default function MenuTop() {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState<string | null>(null);
  const [userRolName, setUserRolName] = useState<string | null>(null);

  const handleClick = (path: string) => {
    setLoading(path); // activa spinner
    router.push(path);
  };

  useEffect(() => {
    const payload = getTokenPayload();
    setUserRolName(payload?.role || null);
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
      {/* Si está cargando esa ruta → spinner */}
      {loading === path ? (
        <ImSpinner9 className="animate-spin text-lg" />
      ) : (
        label
      )}
    </Buton>
  );

  return (
    <>
      {userRolName === "employee" ? (
        <div className="flex gap-3 w-full justify-center items-center mt-2 flex-wrap">
          {renderButton("Noticias registradas", route.news)}
          {renderButton("Actividades registradas", route.activity)}
          {renderButton("Visitantes registrados", route.citofonia)}
          {renderButton("Documentos registrados", route.certification)}
          {renderButton("Foros creados", route.foro)}
          {renderButton("Usuarios registrados", route.user)}
          {renderButton("Colaboradores registrados", route.worker)}
          {renderButton("Asamblea", route.assembly)}
        </div>
      ) : null}
      {userRolName === "owner" ? (
        <div className="flex gap-3 w-full justify-center items-center mt-2 flex-wrap">
          {renderButton("Anuncios registrados", route.add)}
          {renderButton("Actividades registradas", route.immovable)}
          {renderButton("Actividades registradas", route.vacations)}
          {renderButton("Actividades registradas", route.pqr)}
        </div>
      ) : null}
    </>
  );
}

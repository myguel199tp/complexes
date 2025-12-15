"use client";

import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
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
  const [userRoles, setUserRoles] = useState<string[]>([]);

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
    <>
      {hasRole("employee") && userRole === "employee" && (
        <div className="flex gap-3 w-full justify-center items-center mt-2 flex-wrap">
          {renderButton("Noticias registradas", route.news)}
          {renderButton("Actividades registradas", route.activity)}
          {renderButton("Visitantes registrados", route.citofonia)}
          {renderButton("Documentos registrados", route.certification)}
          {renderButton("Foros creados", route.foro)}
          {renderButton("Usuarios registrados", route.user)}
          {renderButton("Colaboradores registrados", route.worker)}
          {renderButton("Asamblea", route.myConvention)}
        </div>
      )}
      {hasRole("owner") && userRole === "owner" && (
        <div className="flex gap-3 w-full justify-center items-center mt-2 flex-wrap">
          {renderButton("Anuncios registrados", route.add)}
          {renderButton("Inmuebles registrados", route.immovable)}
          {renderButton("Reservas registradas", route.vacations)}
          {renderButton("Pqr registrados", route.pqr)}
        </div>
      )}
    </>
  );
}

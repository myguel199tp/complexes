"use client";

import React, { useEffect } from "react";
import Social from "./_components/social";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import SidebarInformation from "@/app/components/ui/sidebar-information"; // Asegúrate que esto es un hook, no un componente

export default function Page() {
  const router = useRouter();

  const { valueState } = SidebarInformation(); // ⚠️ Asegúrate que SidebarInformation sea un hook
  const { userRolName } = valueState;

  console.log("Render Page - userRolName:", userRolName); // <-- ver valor en cada render

  useEffect(() => {
    console.log("useEffect triggered - userRolName:", userRolName);

    if (!userRolName) {
      console.log("userRolName no está definido todavía. Esperando...");
      return;
    }

    if (userRolName !== "useradmin") {
      console.log("Redirigiendo porque userRolName es:", userRolName);
      router.push(route.myprofile);
    } else {
      console.log("Permitiendo acceso, userRolName es useradmin");
    }
  }, [userRolName, router]);

  if (!userRolName || userRolName !== "useradmin") {
    console.log("Ocultando contenido porque userRolName es:", userRolName);
    return null;
  }

  return (
    <div>
      <Social />
    </div>
  );
}

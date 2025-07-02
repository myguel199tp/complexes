"use client";

import React, { useEffect } from "react";
import Social from "./_components/social";
import SidebarInformation from "@/app/components/ui/sidebar-information";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

export default function Page() {
  const router = useRouter();
  const { valueState } = SidebarInformation();
  const { userRolName } = valueState;

  useEffect(() => {
    if (userRolName !== "useradmin") {
      router.push(route.myprofile);
    }
  }, [userRolName, router]);

  return (
    <div>
      <Social />
    </div>
  );
}

"use client";

import React, { useEffect } from "react";
import InfoNewUser from "../_components/info.new-user";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const payload = getTokenPayload();

    if (payload?.role !== "employee") {
      router.push("/my-profile");
    }
  }, [router]);

  return (
    <>
      <InfoNewUser />
    </>
  );
}

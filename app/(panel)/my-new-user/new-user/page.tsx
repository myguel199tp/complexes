"use client";

import React from "react";
import InfoNewUser from "../_components/info.new-user";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { redirect } from "next/navigation";

export default function Page() {
  const payload = getTokenPayload();

  if (payload?.role !== "employee") {
    redirect("/my-profile");
  }
  return (
    <>
      <InfoNewUser />
    </>
  );
}

"use client";

import React from "react";
import Citofonie from "./components/citofonie";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { redirect } from "next/navigation";

export default function Page() {
  const payload = getTokenPayload();

  if (payload?.role !== "employee") {
    redirect("/my-profile");
  }

  return (
    <>
      <Citofonie />
    </>
  );
}

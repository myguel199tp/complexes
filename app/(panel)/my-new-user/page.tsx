"use client";

import React from "react";
import NewRegisterUSer from "./_components/new-register-user";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { redirect } from "next/navigation";

export default function Page() {
  const payload = getTokenPayload();

  if (payload?.role !== "employee") {
    redirect("/my-profile");
  }

  return <NewRegisterUSer />;
}

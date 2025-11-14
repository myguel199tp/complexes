"use client";

import React from "react";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { redirect } from "next/navigation";
import NewRegisterWork from "./_components/new-register-work";

export default function Page() {
  const payload = getTokenPayload();

  if (payload?.role !== "employee") {
    redirect("/my-profile");
  }

  return <NewRegisterWork />;
}

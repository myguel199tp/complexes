"use client";

import React from "react";
import News from "./_components/news";
import { getTokenPayload } from "@/app/helpers/getTokenPayload";
import { redirect } from "next/navigation";

export default function Page() {
  const payload = getTokenPayload();

  if (payload?.role !== "employee") {
    redirect("/my-profile");
  }
  return (
    <>
      <News />
    </>
  );
}

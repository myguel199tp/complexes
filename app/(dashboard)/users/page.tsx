"use client";
import React from "react";
import Sigin from "./_components/sigin";
import { SessionProvider } from "next-auth/react";

export default function page() {
  return (
    <SessionProvider>
      <Sigin />
    </SessionProvider>
  );
}

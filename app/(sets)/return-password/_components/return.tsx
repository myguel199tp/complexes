"use client";
/* eslint-disable @next/next/no-img-element */
import { Title } from "complexes-next-components";
import React from "react";
import PassswordReturn from "./passsword-return";

export default function ReturnPass() {
  return (
    <div className="flex justify-center items-center gap-4 w-full h-full">
      <img src="/complex.jpg" className="rounded-lg" alt="Complexes" />
      <div className="flex justify-center items-center">
        <div>
          <Title font="bold">Recuperar contraseña</Title>
          <PassswordReturn />
        </div>
      </div>
    </div>
  );
}

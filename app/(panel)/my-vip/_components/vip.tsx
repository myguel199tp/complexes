"use client";
import React from "react";
import { Title } from "complexes-next-components";
import PersonalInfo from "./personal-info";

export default function PersonalInformation() {
  return (
    <div>
      <div className="w-full gap-5 flex justify-end mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <Title translate="yes" size="sm" font="bold" className="text-white">
          Información personal
        </Title>
      </div>
      <PersonalInfo />
    </div>
  );
}

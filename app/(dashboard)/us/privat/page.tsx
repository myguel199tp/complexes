"use client";

import { Title } from "complexes-next-components";
import React from "react";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function Page() {
  const { language } = useLanguage();

  return (
    <div
      key={language}
      className="flex w-full bg-cyan-800 rounded-md justify-between items-center"
    >
      <Title size="xs" translate="yes" font="bold" className="p-2 text-white">
        Red privada de conjuntos residenciales
      </Title>
    </div>
  );
}

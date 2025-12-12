"use client";

import { Title, Text } from "complexes-next-components";
import React from "react";

interface Props {
  message?: string;
  description?: string;
  icon?: React.ReactNode;
  className?: string;
  /** If true, use full viewport height; otherwise center inside parent. */
  fullHeight?: boolean;
}

export default function MessageNotData({
  message = "No hay información disponible",
  description = "No se encontraron resultados para mostrar.",
  icon,
  className = "",
  fullHeight = false,
}: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`flex items-center justify-center ${
        fullHeight ? "min-h-screen" : "h-full"
      } px-4`}
    >
      <div
        className={`flex flex-col items-center text-center gap-3 p-6 rounded-2xl shadow-sm border border-transparent/10 bg-white/60 backdrop-blur-sm ${className}`}
      >
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-gray-100/60">
          {icon ?? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-10 h-10 text-gray-400"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8.5A4.5 4.5 0 017.5 4h9A4.5 4.5 0 0121 8.5v7A4.5 4.5 0 0116.5 20h-9A4.5 4.5 0 013 15.5v-7z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 12h8M8 16h5"
              />
            </svg>
          )}
        </div>

        <Title as="h3" font="bold">
          {message}
        </Title>
        <Text font="bold">{description}</Text>
      </div>
    </div>
  );
}

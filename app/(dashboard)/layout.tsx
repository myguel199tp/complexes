"use client";
// app/layout.tsx (o donde estés manejando tu layout raíz)
import React, { useState } from "react";
import TopMenu from "../components/ui/top-menu";
import { Button } from "complexes-next-components";
import { FaMoon, FaSun } from "react-icons/fa";
import { AlertFlag } from "../components/alertFalg";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDayMode, setIsDayMode] = useState(true);
  const toggleMode = () => setIsDayMode((prev) => !prev);

  return (
    <div>
      <div
        className={`min-h-screen transition-all ${
          isDayMode ? "bg-white text-black" : "bg-gray-900 text-white"
        }`}
      >
        <div className="flex items-end justify-end z-40 mt-1 px-5">
          <Button
            rounded="lg"
            colVariant={isDayMode ? "default" : "danger"}
            className="flex justify-center"
            size="sm"
            onClick={toggleMode}
          >
            {isDayMode ? <FaMoon color="black" /> : <FaSun color="yellow" />}
          </Button>
        </div>

        {/* Top menu aquí */}
        <div className="px-5">
          <TopMenu />
          {children}
          <AlertFlag />
        </div>
      </div>
    </div>
  );
}

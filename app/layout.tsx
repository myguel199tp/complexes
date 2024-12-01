"use client";

import "./globals.css";
import { Button } from "complexes-next-components";
import { FaMoon, FaSun } from "react-icons/fa";
import { useState } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isDayMode, setIsDayMode] = useState(true);

  const toggleMode = () => setIsDayMode((prev) => !prev);

  return (
    <html lang="en">
      <body
        className={`h-screen px-5 transition-all ${
          isDayMode ? "bg-white text-black" : "bg-black text-white"
        }`}
      >
        <div className="flex items-center justify-between z-40">
          <Button
            rounded="sm"
            colVariant={isDayMode ? "default" : "danger"}
            size="full"
            className="flex justify-center"
            onClick={toggleMode}
          >
            {isDayMode ? <FaMoon color="black" /> : <FaSun color="yellow" />}
          </Button>
        </div>
        {children}
      </body>
    </html>
  );
}

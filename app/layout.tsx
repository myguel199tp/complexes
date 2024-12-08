"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

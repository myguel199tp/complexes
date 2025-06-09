"use client";
import { Text } from "complexes-next-components";
import React, { useState } from "react";
import { FaWpforms } from "react-icons/fa";
import Form from "./form";
import { FaTableList } from "react-icons/fa6";
import Tables from "./table";

export default function Activity() {
  const [view, setView] = useState<"form" | "table">("form");

  return (
    <div className="w-full p-4">
      <div className="w-full gap-5 flex justify-end mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        {view === "form" && (
          <Text font="bold" className="text-white">
            Registrar actividad
          </Text>
        )}
        {view === "table" && (
          <Text font="bold" className="text-white">
            Actividades registradas
          </Text>
        )}
        <FaWpforms
          size={30}
          className={`cursor-pointer ${
            view === "form"
              ? "text-cyan-800 bg-white rounded-md w-10 "
              : "text-gray-300 bg-white rounded-md w-10"
          }`}
          onClick={() => setView("form")}
        />
        <FaTableList
          size={30}
          className={`cursor-pointer ${
            view === "table"
              ? "text-cyan-800 bg-white rounded-md w-10"
              : "text-gray-300 bg-white rounded-md w-10"
          }`}
          onClick={() => setView("table")}
        />
      </div>
      <div className="flex justify-center items-center">
        {view === "form" && <Form />}
        {view === "table" && <Tables />}
      </div>
    </div>
  );
}

"use client";
import React, { useState } from "react";
import { Text } from "complexes-next-components";
import { FaWpforms } from "react-icons/fa";
import { FaTableList } from "react-icons/fa6";
import Form from "./form";

export default function Foro() {
  const [view, setView] = useState<"form" | "table">("form");

  return (
    <div className="w-full p-4">
      <div className="w-full gap-5 flex justify-end mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        {view === "form" && (
          <Text font="bold" className="text-white">
            Agregar foro
          </Text>
        )}
        {view === "table" && (
          <Text font="bold" className="text-white">
            Foros registrados
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
      <div>{view === "form" && <Form />}</div>
      <div>{view === "table" && <div>hola</div>}</div>
    </div>
  );
}

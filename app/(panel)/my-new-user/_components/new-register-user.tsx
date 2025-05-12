"use client";
import React, { useState } from "react";
import { Tooltip } from "complexes-next-components";
import { FaWpforms } from "react-icons/fa";
import { FaTableList } from "react-icons/fa6";
import Tables from "./table";
import Form from "./form";

export default function NewRegisterUSer() {
  const [view, setView] = useState<"form" | "table">("form");

  return (
    <div className="p-2">
      <div className="w-full flex justify-end mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <Tooltip content="Formulario" maxWidth="14rem" position="left">
          <FaWpforms
            size={30}
            className={`cursor-pointer ${
              view === "form" ? "text-yellow-500" : "text-gray-300"
            }`}
            onClick={() => setView("form")}
          />
        </Tooltip>
        <Tooltip content="Tabla" maxWidth="14rem" position="left">
          <FaTableList
            size={30}
            className={`cursor-pointer ${
              view === "table" ? "text-yellow-500" : "text-gray-300"
            }`}
            onClick={() => setView("table")}
          />
        </Tooltip>
      </div>
      {view === "form" && <Form />}
      {view === "table" && <Tables />}
    </div>
  );
}

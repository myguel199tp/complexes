"use client";
import React, { useState } from "react";
import Table from "./table/table";
import Form from "./formulario/form";
import { Title, Tooltip } from "complexes-next-components";
import { FaWpforms } from "react-icons/fa";
import { FaTableList } from "react-icons/fa6";

export default function Citofonie() {
  const [view, setView] = useState<"form" | "table">("form");

  return (
    <div className="w-full p-4">
      <Title size="md" className="m-4" font="semi" as="h2">
        Registrar Visitante
      </Title>
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
      <div className="rounded-md border-b-4 border-cyan-800">
        {view === "table" && <Table />}
        {view === "form" && <Form />}
      </div>
    </div>
  );
}

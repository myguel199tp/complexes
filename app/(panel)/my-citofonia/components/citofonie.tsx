"use client";
import React, { useState } from "react";
import Table from "./table/table";
import Form from "./formulario/form";
import { Tooltip } from "complexes-next-components";
import { FaWpforms } from "react-icons/fa";
import { FaTableList } from "react-icons/fa6";

export default function Citofonie() {
  const [view, setView] = useState<"form" | "table">("form");

  return (
    <div className="w-full p-4">
      <div className="w-full flex justify-end mr-4">
        <Tooltip content="Formulario" maxWidth="14rem" position="left">
          <FaWpforms
            size={30}
            className={`cursor-pointer ${
              view === "form" ? "text-gray-500" : ""
            }`}
            onClick={() => setView("form")}
          />
        </Tooltip>
        <Tooltip content="Tabla" maxWidth="14rem" position="left">
          <FaTableList
            size={30}
            className={`cursor-pointer ${
              view === "table" ? "text-gray-500" : ""
            }`}
            onClick={() => setView("table")}
          />
        </Tooltip>
      </div>
      {view === "table" && <Table />}
      {view === "form" && <Form />}
    </div>
  );
}

"use client";
import { Title, Tooltip } from "complexes-next-components";
import React, { useState } from "react";
import { FaWpforms } from "react-icons/fa";
import Form from "./form";

export default function Activity() {
  const [view, setView] = useState<"form">("form");

  return (
    <div className="w-full p-4">
      <Title size="md" className="m-4" font="semi" as="h2">
        Crear Actividad
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
      </div>
      <div className="rounded-md border-b-4 border-cyan-800">
        {view === "form" && <Form />}
      </div>
    </div>
  );
}

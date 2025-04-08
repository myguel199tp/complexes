"use client";
import React from "react";
import { Title, Tooltip } from "complexes-next-components";
import { FaWpforms } from "react-icons/fa";
import { FaTableList } from "react-icons/fa6";
import Form from "./_components/form";

export default function Holliday() {
  return (
    <div className="w-full p-2">
      <Title size="md" className="m-4" font="semi" as="h2">
        Registrar Reserva
      </Title>
      <div className="w-full flex justify-end mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <Tooltip content="Formulario" maxWidth="14rem" position="left">
          <FaWpforms size={30} />
        </Tooltip>
        <Tooltip content="Activas" maxWidth="14rem" position="left">
          <FaTableList size={30} />
        </Tooltip>
        <Tooltip content="Tabla antiguas" maxWidth="14rem" position="left">
          <FaTableList size={30} />
        </Tooltip>
      </div>
      <Form />
    </div>
  );
}

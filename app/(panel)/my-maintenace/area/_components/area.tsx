"use client";
import { Title, Tooltip } from "complexes-next-components";
import React from "react";
import { CiViewTable } from "react-icons/ci";
import Form from "./form";

export default function Area() {
  return (
    <>
      <div className="w-full gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div className="cursor-pointer">
          <Tooltip
            content="Mantenimientos registrados"
            className="bg-gray-200"
            position="right"
          >
            <div className="bg-white/20 p-2 rounded-full cursor-pointer">
              <CiViewTable color="white" size={34} />
            </div>
          </Tooltip>
        </div>
        <Title size="sm" font="bold" colVariant="on" translate="yes">
          Registrar Area
        </Title>
      </div>
      <Form />
    </>
  );
}

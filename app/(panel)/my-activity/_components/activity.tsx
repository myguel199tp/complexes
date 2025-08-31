"use client";
import React from "react";
import Form from "./form";
import { FaTableList } from "react-icons/fa6";
import { Title, Tooltip } from "complexes-next-components";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

export default function Activity() {
  const router = useRouter();

  return (
    <>
      <div className="w-full mt-6  gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div>
          <Tooltip
            content="Actividades agregadas"
            className="cursor-pointer"
            position="bottom"
          >
            <FaTableList
              color="white"
              size={50}
              onClick={() => {
                router.push(route.activity);
              }}
            />
          </Tooltip>
        </div>
        <Title size="md" font="bold" className="text-white">
          Agregar Actividad
        </Title>
      </div>
      <Form />
    </>
  );
}

"use client";
import React from "react";
import { Title, Tooltip } from "complexes-next-components";
import { GiReturnArrow } from "react-icons/gi";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";
import Tables from "./table/table";

export default function InfoCitofonie() {
  const router = useRouter();

  return (
    <>
      <div className="w-full mt-6  gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div>
          <Tooltip
            content="Registrar visita"
            className="cursor-pointer"
            position="bottom"
          >
            <GiReturnArrow
              color="white"
              size={50}
              onClick={() => {
                router.push(route.mycitofonia);
              }}
            />
          </Tooltip>
        </div>
        <Title size="md" font="bold" className="text-white">
          Visitas registradas
        </Title>
      </div>
      <Tables />
    </>
  );
}

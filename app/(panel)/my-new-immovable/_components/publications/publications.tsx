"use client";
import { Tabs, Title, Tooltip } from "complexes-next-components";
import React from "react";
import Cardinfo from "../card-immovables/card-info";
import { FaTableList } from "react-icons/fa6";
import { useRouter } from "next/navigation";
import { route } from "@/app/_domain/constants/routes";

export default function Publications() {
  const router = useRouter();

  const imagesSet1 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];
  const imagesSet2 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];
  const imagesSet3 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];
  const imagesSet4 = [
    "https://th.bing.com/th/id/OIP.3k7MGSuN1_d7G6uDxNBapgHaFP?pid=ImgDet&rs=2",
  ];

  const tabs = [
    {
      label: "Antiguas",
      children: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full h-full p-4">
          <Cardinfo images={imagesSet1} />
          <Cardinfo images={imagesSet2} />
          <Cardinfo images={imagesSet3} />
          <Cardinfo images={imagesSet4} />
        </div>
      ),
    },
    {
      label: "Activas",
      children: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full h-full p-4">
          <Cardinfo images={imagesSet1} />
          <Cardinfo images={imagesSet2} />
        </div>
      ),
    },
    {
      label: "Por vencer",
      children: (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full h-full p-4">
          <Cardinfo images={imagesSet1} />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full h-screen px-4">
      <div className="w-full mb-6  gap-5 flex justify-between mr-4 bg-cyan-800 shadow-lg opacity-80 p-2 rounded-md">
        <div>
          <Tooltip
            content="Acyividade agregadas"
            className="cursor-pointer bg-gray-200"
            position="right"
          >
            <FaTableList
              color="white"
              size={50}
              onClick={() => {
                router.push(route.mynewimmovable);
              }}
            />
          </Tooltip>
        </div>
        <Title size="md" font="bold" colVariant="on">
          Inmuebles Registrados
        </Title>
      </div>

      <Tabs tabs={tabs} defaultActiveIndex={0} />
    </div>
  );
}

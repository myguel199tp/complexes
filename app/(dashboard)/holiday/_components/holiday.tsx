"use client";
import { Buton, Text } from "complexes-next-components";
import React, { useState } from "react";
import { FaBuilding, FaHome } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import { MdBedroomParent } from "react-icons/md";
import { PiFarmFill } from "react-icons/pi";

export default function Holiday() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const iconData = [
    {
      label: "Apartamento",
      icon: <FaBuilding size={25} className="text-white" />,
      subOptions: ["apartamento", "Penthouse", "Loft", "Estudio", "duplex"],
    },
    {
      label: "Casa",
      icon: <FaHome size={25} className="text-white" />,
      subOptions: [
        "Casa",
        "Casa de campo",
        "Casa pequeña",
        "Casa rural",
        "Casa en arbol",
        "Casa rodante",
        "Casa cueva",
        "Chalet",
        "Villa",
        "Riads",
      ],
    },
    {
      label: "Granja",
      icon: <PiFarmFill size={25} className="text-white" />,
      subOptions: ["Finca", "Eco-granja", "Hacienda"],
    },
    {
      label: "Alternativos",
      icon: <MdBedroomParent size={25} className="text-white" />,
      subOptions: ["Glamping", "Bungalow", "Tipis", "Yutras", "Eco-lodges"],
    },
    {
      label: "Compartidos",
      icon: <MdBedroomParent size={25} className="text-white" />,
      subOptions: ["Habitacion", "Posada"],
    },
    {
      label: "Vivienda móil",
      icon: <MdBedroomParent size={25} className="text-white" />,
      subOptions: [
        "Campers",
        "Autocaravana",
        "Barcos",
        "Veleros",
        "Yates",
        "Rodante",
      ],
    },
  ];

  const toggleSubOptions = (label: string) => {
    setActiveLabel((prev) => (prev === label ? null : label));
  };

  return (
    <div>
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl p-4">
        <div className="flex justify-center gap-12">
          <Buton size="md" rounded="lg" className="hover:bg-gray-200">
            <div className="flex gap-3 cursor-pointer">
              <IoFilter size={20} />
              <Text size="sm" className="text-white">
                Filtros
              </Text>
            </div>
          </Buton>
        </div>

        <div className="grid grid-cols-10 gap-3 mt-3">
          {iconData.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center cursor-pointer hover:bg-gray-500 p-2 rounded-lg ${
                activeLabel === item.label ? "bg-gray-500" : ""
              }`}
              onClick={() => toggleSubOptions(item.label)}
            >
              {item.icon}
              {item.label && (
                <span className="text-sm text-white">{item.label}</span>
              )}
            </div>
          ))}
        </div>

        {activeLabel && (
          <div className="mt-4 bg-white p-4 rounded-lg shadow-md">
            <Text size="md" className="font-semibold mb-2">
              Subcategorías de {activeLabel}
            </Text>
            <div className="flex flex-wrap gap-2">
              {iconData
                .find((item) => item.label === activeLabel)
                ?.subOptions?.map((sub, i) => (
                  <span
                    key={i}
                    className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-orange-200"
                  >
                    {sub}
                  </span>
                ))}
              {!iconData.find((item) => item.label === activeLabel)
                ?.subOptions && (
                <Text size="sm" className="text-gray-500">
                  No hay subcategorías disponibles.
                </Text>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

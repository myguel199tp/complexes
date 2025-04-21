"use client";
import {
  Buton,
  InputField,
  SelectField,
  Text,
} from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { FaBuilding, FaHome } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import { MdBedroomParent } from "react-icons/md";
import { PiFarmFill } from "react-icons/pi";
import Cardinfo from "./card-holiday/card-info";
import { hollidaysService } from "../services/hollidayService";
import { HollidayResponses } from "../services/response/holidayResponses";

export default function Holiday() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const [data, setData] = useState<HollidayResponses[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await hollidaysService();
      setData(result);
    };

    fetchData();
  }, []);
  const options = [
    { value: "Bogotá", label: "Bogotá" },
    { value: "Medellin", label: "Medellin" },
    { value: "Cali", label: "Cali" },
  ];

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
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className=" flex flex-col md:!flex-row justify-center p-2 items-center gap-0 md:!gap-10 ">
          <Text className="text-white" font="bold" size="lg">
            _Tu siguente destino_
          </Text>
          <SelectField
            className="mt-2"
            options={options}
            inputSize="md"
            defaultOption="Ciudad"
          />
          <Buton size="md" rounded="lg" className="hover:bg-gray-200">
            <div className="flex gap-1 cursor-pointer">
              <IoFilter size={20} className="text-white" />
              <Text className="text-white" size="sm">
                Filtros
              </Text>
            </div>
          </Buton>
        </div>
        <div className="p-2">
          <InputField placeholder="Buscar" rounded="lg" />
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
      <div className="grid grid-cols-1 md:!grid-cols-4 gap-2 h-screen mt-4">
        {data.map((e) => {
          const infodata = e.files.map((file) =>
            typeof file === "string" ? file : file.filename
          );
          return (
            <Cardinfo
              key={e._id}
              files={infodata}
              city={e.city}
              neigborhood={e.neigborhood}
              parking={e.parking}
              price={e.price}
              country={e.country}
              description={e.description}
            />
          );
        })}
      </div>
    </div>
  );
}

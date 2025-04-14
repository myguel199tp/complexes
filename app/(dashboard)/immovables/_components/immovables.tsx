"use client";
import {
  SelectField,
  Buton,
  InputField,
  Text,
  Tooltip,
} from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { FaBuilding, FaHome } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { HiBuildingOffice2 } from "react-icons/hi2";
import { IoFilter } from "react-icons/io5";
import {
  MdBedroomParent,
  MdLocalConvenienceStore,
  MdOutlineApartment,
  MdOutlineSpaceDashboard,
} from "react-icons/md";
import { PiFarmFill } from "react-icons/pi";
import { SiLibreofficecalc } from "react-icons/si";
import Cardinfo from "./card-immovables/card-info";
import { InmovableResponses } from "../services/response/inmovableResponses";
import { immovableService } from "../services/inmovableService";
import ModalInmovables from "./Modal/modal-immovables";

export default function Immovables() {
  const [showSkill, setShowSkill] = useState<boolean>(false);

  const openModal = () => {
    setShowSkill(true);
  };

  const closeModal = () => {
    setShowSkill(false);
  };
  const [data, setData] = useState<InmovableResponses[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await immovableService();
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
    },
    { label: "Casa", icon: <FaHome size={25} className="text-white" /> },
    { label: "Granja", icon: <PiFarmFill size={25} className="text-white" /> },
    { label: "Local", icon: <FaShop size={25} className="text-white" /> },
    {
      label: "Oficina",
      icon: <SiLibreofficecalc size={25} className="text-white" />,
    },
    {
      label: "Bodega",
      icon: <MdLocalConvenienceStore size={25} className="text-white" />,
    },
    {
      label: "lote",
      icon: <MdOutlineSpaceDashboard size={25} className="text-white" />,
    },
    {
      label: "Dormitorio",
      icon: <MdBedroomParent size={25} className="text-white" />,
    },
    {
      label: "Aparta estudio",
      icon: <MdOutlineApartment size={25} className="text-white" />,
    },
    {
      label: "Edificio",
      icon: <HiBuildingOffice2 size={25} className="text-white" />,
    },
  ];

  return (
    <div>
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className=" flex flex-col md:!flex-row justify-center items-center gap-0 md:!gap-10 ">
          <Text className="text-white" font="bold" size="lg">
            _Tu siguente hogar_
          </Text>
          <SelectField
            className="mt-2"
            options={options}
            inputSize="md"
            defaultOption="Ciudad"
          />
          <Buton
            size="md"
            rounded="lg"
            className="hover:bg-gray-500 mt-2"
            onClick={() => openModal()}
          >
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
        <div
          className=" grid 
          p-3
          grid-cols-10 
          gap-6 
          mt-1
          overflow-x-auto 
          md:overflow-x-visible 
          whitespace-nowrap 
          scroll-smooth"
        >
          {iconData.map((item, index) => (
            <div key={index}>
              <Tooltip content={item.label}>
                <div className="flex flex-col items-center justify-center cursor-pointer hover:bg-gray-200 p-2 rounded-lg">
                  {item.icon}
                </div>
              </Tooltip>
            </div>
          ))}
        </div>
      </section>
      <div className="grid grid-cols-1 md:!grid-cols-4 gap-2 h-screen mt-4">
        {data.map((e) => {
          const infodata = e.files.map((file) =>
            typeof file === "string" ? file : file.filename
          );
          return (
            <Cardinfo
              key={e._id}
              area={e.area}
              images={infodata}
              city={e.city}
              neighborhood={e.neighborhood}
              ofert={e.ofert === "1" ? "Venta" : "Arriendo"}
              parking={e.parking}
              price={e.price}
              restroom={e.restroom}
              room={e.room}
              _id={e._id}
              administration={e.administration}
              stratum={e.stratum}
              age={e.age}
              country={e.country}
              phone={e.phone}
              email={e.email}
              description={e.description}
            />
          );
        })}
      </div>

      {showSkill && (
        <ModalInmovables title="Filtros" isOpen onClose={closeModal} />
      )}
    </div>
  );
}

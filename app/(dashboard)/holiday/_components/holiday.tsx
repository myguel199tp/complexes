"use client";
import { Buton, Button, InputField, Text } from "complexes-next-components";
import React from "react";
import { FaBuilding, FaHome } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import { MdBedroomParent } from "react-icons/md";
import { PiFarmFill } from "react-icons/pi";
import HolidayInfo from "./holiday-info";
import Cardinfo from "./card-holiday/card-info";

export default function Holiday() {
  const {
    filteredData,
    handleInputChange,
    openModal,
    uiState,
    setUiState,
    setActiveLabel,
    setFilters,
    activeLabel,
    filters,
  } = HolidayInfo();

  const toggleSubOptions = (label: string) => {
    setActiveLabel((prev) => (prev === label ? null : label));
  };

  const iconData = [
    {
      label: "Apartamento",
      icon: <FaBuilding size={25} className="text-white" />,
      subOptions: [
        { value: 1, title: "Apartamento" },
        { value: 2, title: "Penthouse" },
        { value: 3, title: "Loft" },
        { value: 4, title: "Estudio" },
        { value: 5, title: "Duplex" },
      ],
    },
    {
      label: "Casa",
      icon: <FaHome size={25} className="text-white" />,
      subOptions: [
        { value: 6, title: "Casa" },
        { value: 7, title: "Casa de campo" },
        { value: 8, title: "Casa pequeña" },
        { value: 9, title: "Casa rural" },
        { value: 10, title: "Casa en árbol" },
        { value: 11, title: "Casa rodante" },
        { value: 12, title: "Casa cueva" },
        { value: 13, title: "Chalet" },
        { value: 14, title: "Villa" },
        { value: 15, title: "Riads" },
      ],
    },
    {
      label: "Granja",
      icon: <PiFarmFill size={25} className="text-white" />,
      subOptions: [
        { value: 16, title: "Finca" },
        { value: 17, title: "Eco-granja" },
        { value: 18, title: "Hacienda" },
      ],
    },
    {
      label: "Alternativos",
      icon: <MdBedroomParent size={25} className="text-white" />,
      subOptions: [
        { value: 19, title: "Glamping" },
        { value: 20, title: "Bungalow" },
        { value: 21, title: "Tipis" },
        { value: 22, title: "Yutras" },
        { value: 23, title: "Eco-lodges" },
      ],
    },
    {
      label: "Compartidos",
      icon: <MdBedroomParent size={25} className="text-white" />,
      subOptions: [
        { value: 24, title: "Habitación" },
        { value: 25, title: "Posada" },
      ],
    },
    {
      label: "Vivienda móvil",
      icon: <MdBedroomParent size={25} className="text-white" />,
      subOptions: [
        { value: 26, title: "Campers" },
        { value: 27, title: "Autocaravana" },
        { value: 28, title: "Barcos" },
        { value: 29, title: "Veleros" },
        { value: 30, title: "Yates" },
        { value: 31, title: "Rodante" },
      ],
    },
  ];

  return (
    <div>
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className="flex flex-col md:!flex-row justify-center p-2 items-center gap-0 md:!gap-10">
          <Text className="text-white" font="bold" size="lg">
            _Tu siguiente destino_
          </Text>
          <Buton size="md" borderWidth="thin" rounded="lg" onClick={openModal}>
            <div className="flex gap-1 cursor-pointer">
              <IoFilter size={20} className="text-white" />
              <Text className="text-white" size="sm">
                Filtros
              </Text>
            </div>
          </Buton>
        </div>
        <div className="p-2">
          <InputField
            placeholder="Buscar ciudad o barrio"
            rounded="lg"
            value={uiState.search}
            onChange={(e) =>
              setUiState((prev) => ({ ...prev, search: e.target.value }))
            }
          />
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
          <Button
            size="sm"
            rounded="lg"
            onClick={() => setFilters((prev) => ({ ...prev, property: "" }))}
          >
            Limpiar
          </Button>
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
                  <Button
                    key={i}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        property: String(sub.value),
                      }))
                    }
                    size="sm"
                    rounded="lg"
                    colVariant={
                      filters.property === String(sub.value)
                        ? "default"
                        : "warning"
                    }
                  >
                    {sub.title}
                  </Button>
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

        {uiState.showSkill && (
          <div className="p-4 flex items-center gap-4 flex-wrap">
            <div className="flex items-center">
              <InputField
                className="bg-transparent text-gray-300"
                placeholder="Precio desde COP"
                id="minPrice"
                type="number"
                value={filters.minPrice}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex items-center">
              <InputField
                className="bg-transparent text-gray-300"
                placeholder="Precio hasta COP"
                id="maxPrice" // cambiado de "copEnd" a "maxPrice"
                type="number"
                value={filters.maxPrice}
                onChange={handleInputChange}
              />
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:!grid-cols-4 gap-2 h-screen mt-4">
        {filteredData.map((e) => {
          const infodata = e.files.map((file) =>
            typeof file === "string" ? file : file.filename
          );
          return (
            <Cardinfo
              key={e.id}
              files={infodata}
              city={e.city}
              neigborhood={e.neigborhood}
              parking={e.parking}
              price={e.price}
              property={e.property}
              country={e.country}
              description={e.description}
              address={e.address}
              apartment={e.apartment}
              cel={e.cel}
              endDate={e.endDate}
              maxGuests={e.maxGuests}
              name={e.name}
              nameUnit={e.nameUnit}
              petsAllowed={e.petsAllowed}
              promotion={e.promotion}
              ruleshome={e.ruleshome}
              startDate={e.startDate}
            />
          );
        })}
      </div>
    </div>
  );
}

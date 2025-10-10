"use client";
import { Buton, Button, InputField, Text } from "complexes-next-components";
import React from "react";
import { IoFilter } from "react-icons/io5";
import HolidayInfo from "./holiday-info";
import Cardinfo from "./card-holiday/card-info";
import { useCountryCityOptions } from "../../registers/_components/register-option";
import { iconData } from "./constants";

export default function Holiday() {
  const {
    filteredDataHollliday,
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
  const { countryOptions, data } = useCountryCityOptions();

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
        {filteredDataHollliday.map((e) => {
          const infodata = e.files.map((file) =>
            typeof file === "string" ? file : file.filename
          );

          const countryLabel =
            countryOptions.find((c) => c.value === String(e.country))?.label ||
            e.country;

          const cityLabel =
            data
              ?.find((c) => String(c.ids) === String(e.country))
              ?.city.find((c) => String(c.id) === String(e.city))?.name ||
            e.city;

          return (
            <Cardinfo
              key={e.id}
              files={infodata}
              city={cityLabel}
              neigborhood={e.neigborhood}
              parking={e.parking}
              price={e.price}
              property={e.property}
              country={countryLabel}
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
              codigo={e.codigo}
              amenities={e.amenities}
            />
          );
        })}
      </div>
    </div>
  );
}

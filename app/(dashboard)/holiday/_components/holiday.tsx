"use client";
import {
  Buton,
  Button,
  InputField,
  SelectField,
  Text,
  Title,
} from "complexes-next-components";
import React from "react";
import { IoEarthOutline, IoFilter } from "react-icons/io5";
import HolidayInfo from "./holiday-info";
import Cardinfo from "./card-holiday/card-info";
import { useCountryCityOptions } from "../../registers/_components/register-option";
import { iconData } from "./constants";
import { FaCity, FaClock, FaHistory, FaStar } from "react-icons/fa";

export default function Holiday() {
  const {
    filteredDataHollliday,
    handleInputChange,
    openModal,
    uiState,
    setUiState,
    toggleSubOptions,
    handleCountryChange,
    handleSwitchChange,
    handleClear,
    setFilters,
    activeLabel,
    filters,
  } = HolidayInfo();

  const sortOptions = [
    {
      label: "Destacados",
      value: "highlight",
      icon: <FaStar className="inline mr-2" />,
    },
    {
      label: "Más recientes",
      value: "recent",
      icon: <FaClock className="inline mr-2" />,
    },
    {
      label: "Más antiguos",
      value: "old",
      icon: <FaHistory className="inline mr-2" />,
    },
  ];

  const { countryOptions, data } = useCountryCityOptions();

  return (
    <div>
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between p-2 items-center gap-0 md:gap-10">
          <Title as="h5" className="text-white" font="bold" size="md">
            Explora y reserva tu próximo alojamiento
          </Title>
          <Buton
            size="md"
            borderWidth="thin"
            rounded="lg"
            className="mt-2 end-0"
            onClick={openModal}
          >
            <div className="flex gap-1 cursor-pointer">
              <IoFilter size={30} className="text-white" />
              <Text className="text-white" size="md">
                Filtros
              </Text>
            </div>
          </Buton>
        </div>
        <div className="flex gap-3 p-2">
          {/* País */}
          <div className="relative w-[50%]">
            <IoEarthOutline className="absolute left-3 top-[45%] -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
            <SelectField
              id="country"
              sizeHelp="sm"
              searchable
              helpText="Seleccionar país"
              className="pl-10"
              options={[
                { value: "", label: "Cualquier país" },
                ...countryOptions.map((c) => ({
                  value: c.value,
                  label: c.label,
                })),
              ]}
              value={filters.country}
              onChange={handleCountryChange}
            />
          </div>

          {/* Ciudad */}
          <div className="relative w-[50%]">
            <FaCity className="absolute left-3 top-[45%] -translate-y-1/2 text-gray-500 text-lg pointer-events-none" />
            <SelectField
              id="city"
              sizeHelp="sm"
              searchable
              helpText="Seleccionar ciudad"
              className="pl-10"
              options={[
                { value: "", label: "Cualquier ciudad" },
                ...(data
                  ?.find((c) => String(c.ids) === String(filters.country))
                  ?.city.map((city) => ({
                    value: String(city.id),
                    label: city.name,
                  })) || []),
              ]}
              value={filters.city}
              onChange={handleInputChange}
              disabled={!filters.country}
            />
          </div>
        </div>
        {/* 🔹 Buscador */}
        <div className="p-2 flex gap-2">
          <InputField
            placeholder="Buscar"
            rounded="md"
            className="h-14"
            value={uiState.search}
            onChange={(e) =>
              setUiState((prev) => ({ ...prev, search: e.target.value }))
            }
          />
          <SelectField
            id="sort"
            options={sortOptions}
            value={filters.sort}
            onChange={handleInputChange}
          ></SelectField>
        </div>

        {/* 🔹 Iconos principales */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3 mt-3">
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
                <span className="text-sm text-white text-center">
                  {item.label}
                </span>
              )}
            </div>
          ))}
          <Button
            size="sm"
            rounded="lg"
            className="m-2"
            onClick={() =>
              setFilters({
                property: "",
                minPrice: "",
                maxPrice: "",
                country: "",
                city: "",
              })
            }
          >
            Limpiar
          </Button>
        </div>

        {/* 🔹 Subopciones */}
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
          <div className="p-4 flex flex-col md:!flex-row w-full items-center gap-4 bg-cyan-900 rounded-lg mt-2">
            <div className="flex flex-col md:!flex-row flex-1 min-w-[250px] gap-3">
              <InputField
                placeholder="Precio desde"
                id="minPrice"
                type="number"
                value={filters.minPrice}
                onChange={handleInputChange}
                className="w-full"
              />
              <InputField
                placeholder="Precio hasta"
                id="maxPrice"
                type="number"
                value={filters.maxPrice}
                onChange={handleInputChange}
                className="w-full"
              />
              <InputField
                placeholder="Capacidad de huespedes"
                id="maxGuests" // <-- aquí
                type="number"
                value={filters.maxGuests}
                onChange={handleInputChange}
                className="w-full"
              />
            </div>

            <div className="flex flex-col md:!flex-row flex-1 flex-wrap justify-between items-center gap-4 text-white">
              <div className="flex items-center justify-around flex-1 min-w-[200px]">
                <button
                  onClick={() => handleSwitchChange("petsAllowed")}
                  className={`relative w-11 h-6 flex items-center rounded-full transition-colors duration-300 ${
                    filters.petsAllowed === "true"
                      ? "bg-cyan-800"
                      : filters.petsAllowed === "false"
                      ? "bg-gray-500"
                      : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute left-1 w-4 h-4 rounded-full bg-white transform transition-transform duration-300 ${
                      filters.petsAllowed === "true"
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
                <label htmlFor="petsAllowed" className="text-sm">
                  Mascotas permitidas
                </label>
              </div>

              <div className="flex items-center justify-around flex-1 min-w-[200px]">
                <button
                  onClick={() => handleSwitchChange("parking")}
                  className={`relative w-11 h-6 flex items-center rounded-full transition-colors duration-300 ${
                    filters.parking === "true"
                      ? "bg-cyan-800"
                      : filters.parking === "false"
                      ? "bg-gray-500"
                      : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute left-1 w-4 h-4 rounded-full bg-white transform transition-transform duration-300 ${
                      filters.parking === "true"
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
                <label htmlFor="parking" className="text-sm">
                  Parqueadero
                </label>
              </div>

              <div className="flex items-center justify-around  flex-1 min-w-[200px]">
                <button
                  onClick={() => handleSwitchChange("eventsAllowed")}
                  className={`relative w-11 h-6 flex items-center rounded-full transition-colors duration-300 ${
                    filters.eventsAllowed === "true"
                      ? "bg-cyan-800"
                      : filters.eventsAllowed === "false"
                      ? "bg-gray-500"
                      : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute left-1 w-4 h-4 rounded-full bg-white transform transition-transform duration-300 ${
                      filters.eventsAllowed === "true"
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  />
                </button>
                <label htmlFor="eventsAllowed" className="text-sm">
                  Eventos permitidos
                </label>
              </div>

              {/* Botón limpiar */}
              <button
                onClick={handleClear}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg text-sm flex-shrink-0"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
      </section>

      {/* 🔹 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-4">
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
              videoUrl={e.videoUrl}
              anfitrion={e.anfitrion}
              image={e.image}
              deposit={e.deposit}
              bedRooms={e.bedRooms}
              city={cityLabel}
              neigborhood={e.neigborhood}
              bartroomPrivate={e.bartroomPrivate}
              indicative={e.indicative}
              cleaningFee={e.cleaningFee}
              parking={e.parking}
              price={e.price}
              property={e.property}
              country={countryLabel}
              description={e.description}
              address={e.address}
              apartment={e.apartment}
              cel={e.cel}
              currency={e.currency}
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

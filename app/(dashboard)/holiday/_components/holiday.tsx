"use client";
import {
  Buton,
  Button,
  InputField,
  SelectField,
  Text,
  Title,
  Tooltip,
} from "complexes-next-components";
import React from "react";
import { IoFilter, IoSearchCircle } from "react-icons/io5";
import HolidayInfo from "./holiday-info";
import Cardinfo from "./card-holiday/card-info";
import { useCountryCityOptions } from "../../registers/_components/register-option";
import { iconData } from "./constants";
import { FaClock, FaHistory, FaStar } from "react-icons/fa";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { SiCcleaner } from "react-icons/si";
import { MdOutlinePets } from "react-icons/md";
import { FaCarAlt } from "react-icons/fa";
import { BiSolidParty } from "react-icons/bi";

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
  const [filtersCash, setFiltersCash] = React.useState({
    minPrice: 60000,
    maxPrice: 800000,
  });

  const handleSliderChangeCash = (value: number | number[]) => {
    if (Array.isArray(value)) {
      const [min, max] = value;
      setFiltersCash({ minPrice: min, maxPrice: max });
      setFilters((prev) => ({
        ...prev,
        minPrice: String(min),
        maxPrice: String(max),
      }));
    }
  };

  const handleInputChangeCash = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFiltersCash((prev) => ({
      ...prev,
      [id]: Number(value),
    }));
  };

  return (
    <div>
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between p-2 items-center gap-0 md:gap-10">
          <Title as="h5" className="text-white" font="bold" size="xs">
            🏖️ Explora y reserva tu próximo alojamiento
          </Title>
          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            className="mt-2 end-0"
            onClick={openModal}
          >
            <div className="flex gap-1 cursor-pointer">
              <IoFilter size={20} className="text-white" />
              <Text className="text-white" size="sm">
                Filtros
              </Text>
            </div>
          </Buton>
        </div>
        <div className="flex gap-3 p-2">
          {/* País */}
          <div className="relative w-[40%]">
            <SelectField
              id="country"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              searchable
              helpText="Seleccionar país"
              options={[
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
          <div className="relative w-[40%]">
            <SelectField
              id="city"
              sizeHelp="xs"
              inputSize="sm"
              rounded="lg"
              searchable
              helpText="Seleccionar ciudad"
              className="pl-10"
              options={[
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

          <div className="relative w-[20%]">
            <InputField
              helpText="Cuantos son"
              sizeHelp="xs"
              inputSize="sm"
              placeholder="Cuantos son"
              rounded="lg"
              id="maxGuests"
              type="number"
              value={filters.maxGuests}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>
        </div>
        {/* 🔹 Buscador */}
        <div className="p-2 flex gap-2">
          <InputField
            placeholder="Buscar"
            rounded="lg"
            inputSize="sm"
            prefixElement={<IoSearchCircle size={15} />}
            value={uiState.search}
            onChange={(e) =>
              setUiState((prev) => ({ ...prev, search: e.target.value }))
            }
          />

          <SelectField
            id="sort"
            rounded="lg"
            inputSize="sm"
            options={sortOptions}
            value={filters.sort}
            onChange={handleInputChange}
          ></SelectField>
        </div>

        {/* 🔹 Iconos principales */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3 items-center ">
          {iconData.map((item, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center cursor-pointer hover:bg-gray-300 p-2 rounded-lg ${
                activeLabel === item.label ? "bg-gray-500" : ""
              }`}
              onClick={() => toggleSubOptions(item.label)}
            >
              {item.icon}
              {item.label && (
                <Text size="sm" colVariant="on" className="text-center">
                  {item.label}
                </Text>
              )}
            </div>
          ))}
          <Buton
            size="sm"
            rounded="lg"
            borderWidth="none"
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
            <SiCcleaner className="text-gray-200" size={20} />
          </Buton>
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
            <div className="flex flex-col md:!flex-row flex-1 min-w-[250px] gap-3 border rounded-lg shadow-sm">
              <div className="w-full max-w-md p-4 ">
                <Text size="xs" colVariant="on">
                  {filtersCash.minPrice.toLocaleString()} –{" "}
                  {filtersCash.maxPrice.toLocaleString()}+
                </Text>

                <Slider
                  range
                  min={0}
                  max={1000000}
                  step={10000}
                  value={[filtersCash.minPrice, filtersCash.maxPrice]}
                  onChange={handleSliderChangeCash}
                  trackStyle={[{ backgroundColor: "orange" }]}
                  handleStyle={[
                    { borderColor: "orange", backgroundColor: "orange" },
                    { borderColor: "#2563eb", backgroundColor: "#orange" },
                  ]}
                  railStyle={{ backgroundColor: "#e5e7eb" }}
                />
              </div>
              <div className="flex gap-3 mt-4">
                <div className="flex-1">
                  <InputField
                    placeholder="Desde"
                    id="minPrice"
                    inputSize="sm"
                    type="number"
                    value={filters.minPrice}
                    onChange={handleInputChangeCash}
                    className="w-full"
                  />
                </div>

                <div className="flex-1">
                  <InputField
                    placeholder="Hasta"
                    id="maxPrice"
                    inputSize="sm"
                    type="number"
                    value={filters.maxPrice}
                    onChange={handleInputChangeCash}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:!flex-row flex-1 flex-wrap justify-between items-center gap-4 text-white">
              <Tooltip
                content="Aceptan mascotas"
                position="top"
                className="bg-gray-300"
              >
                <Buton
                  onClick={() => handleSwitchChange("petsAllowed")}
                  borderWidth="none"
                  className={`relative w-14 h-6 flex items-center rounded-full transition-colors duration-300 ${
                    filters.petsAllowed === "true"
                      ? "bg-cyan-800"
                      : filters.petsAllowed === "false"
                      ? "bg-gray-500"
                      : "bg-gray-700"
                  }`}
                >
                  {/* Thumb con ícono */}
                  <span
                    className={`absolute flex items-center justify-center left-1 w-5 h-5 rounded-full bg-white transform transition-transform duration-300 ${
                      filters.petsAllowed === "true"
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  >
                    <MdOutlinePets
                      className={`transition-colors duration-300 ${
                        filters.petsAllowed === "true"
                          ? "text-cyan-800"
                          : "text-gray-500"
                      }`}
                      size={14}
                    />
                  </span>
                </Buton>
              </Tooltip>
              <Tooltip
                content="Cuenta con parqueadero"
                position="top"
                className="bg-gray-300"
              >
                <Buton
                  onClick={() => handleSwitchChange("parking")}
                  borderWidth="none"
                  className={`relative w-11 h-6 flex items-center rounded-full transition-colors duration-300 ${
                    filters.parking === "true"
                      ? "bg-cyan-800"
                      : filters.parking === "false"
                      ? "bg-gray-500"
                      : "bg-gray-700"
                  }`}
                >
                  <span
                    className={`absolute flex items-center justify-center left-1 w-5 h-5 rounded-full bg-white transform transition-transform duration-300 ${
                      filters.parking === "true"
                        ? "translate-x-5"
                        : "translate-x-0"
                    }`}
                  >
                    <FaCarAlt
                      className={`transition-colors duration-300 ${
                        filters.parking === "true"
                          ? "text-cyan-800"
                          : "text-gray-500"
                      }`}
                      size={14}
                    />
                  </span>
                </Buton>
              </Tooltip>

              <Buton
                onClick={() => handleSwitchChange("eventsAllowed")}
                borderWidth="none"
                className={`relative w-11 h-6 flex items-center rounded-full transition-colors duration-300 ${
                  filters.eventsAllowed === "true"
                    ? "bg-cyan-800"
                    : filters.eventsAllowed === "false"
                    ? "bg-gray-500"
                    : "bg-gray-700"
                }`}
              >
                <span
                  className={`absolute flex items-center justify-center left-1 w-5 h-5 rounded-full bg-white transform transition-transform duration-300 ${
                    filters.eventsAllowed === "true"
                      ? "translate-x-5"
                      : "translate-x-0"
                  }`}
                >
                  <BiSolidParty
                    className={`transition-colors duration-300 ${
                      filters.eventsAllowed === "true"
                        ? "text-cyan-800"
                        : "text-gray-500"
                    }`}
                    size={14}
                  />
                </span>
              </Buton>

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
      <div className="grid gap-4 mt-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6">
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
              videos={e.videos}
            />
          );
        })}
      </div>
    </div>
  );
}

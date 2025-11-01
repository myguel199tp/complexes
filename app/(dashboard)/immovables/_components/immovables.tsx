"use client";

import {
  Buton,
  InputField,
  SelectField,
  Text,
  Tooltip,
} from "complexes-next-components";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import React from "react";
import { IoFilter, IoSearchCircle } from "react-icons/io5";
import { Cardinfo } from "./card-immovables/card-info";
import ImmovablesInfo from "./immovables-info";
import { ImSpinner9 } from "react-icons/im";
import { useCountryCityOptions } from "../../registers/_components/register-option";
import { iconData } from "../../holiday/_components/constants";
import { SiCcleaner } from "react-icons/si";
import { FaClock, FaStar } from "react-icons/fa6";
import { FaHistory } from "react-icons/fa";

// Opciones de ejemplo (puedes moverlas a un archivo constants si ya existen)
const ofertOptions = [
  { label: "Venta", value: "1" },
  { label: "Arriendo", value: "2" },
];

const parkingOptions = [
  { label: "1 parqueadero", value: "1" },
  { label: "2 parqueaderos", value: "2" },
  { label: "3 parqueaderos", value: "3" },
  { label: "4+", value: "4" },
];

const roomOptions = [
  { label: "1 habitación", value: "1" },
  { label: "2 habitaciones", value: "2" },
  { label: "3 habitaciones", value: "3" },
  { label: "4+", value: "4" },
];

const restroomOptions = [
  { label: "1 baño", value: "1" },
  { label: "2 baños", value: "2" },
  { label: "3 baños", value: "3" },
  { label: "4+", value: "4" },
];

export default function Immovables() {
  const {
    handleInputChange,
    handleCountryChange,
    handleClear,
    openModal,
    setFilters,
    setUiState,
    handleCityChange,
    filters,
    uiState,
    filteredDataHollliday,
  } = ImmovablesInfo();

  const { countryOptions, data: countryCityData } = useCountryCityOptions();

  // === SLIDERS ===
  const [filtersCash, setFiltersCash] = React.useState({
    minPrice: 60000,
    maxPrice: 800000,
  });

  const [filtersArea, setFiltersArea] = React.useState({
    minArea: 10,
    maxArea: 1000,
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

  const handleSliderChangeArea = (value: number | number[]) => {
    if (Array.isArray(value)) {
      const [min, max] = value;
      setFiltersArea({ minArea: min, maxArea: max });
      setFilters((prev) => ({
        ...prev,
        minArea: String(min),
        maxArea: String(max),
      }));
    }
  };

  const handleInputChangeCash = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    const numericValue = Number(value);
    setFiltersCash((prev) => ({
      ...prev,
      [id]: numericValue,
    }));
    setFilters((prev) => ({
      ...prev,
      [id]: String(numericValue),
    }));
  };

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

  return (
    <div>
      {/* ===== CABECERA ===== */}
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between p-2 items-center gap-0 md:gap-10">
          <div className="w-[70%]">
            <Text colVariant="on" font="bold" size="lg">
              Encuentra tu hogar ideal
            </Text>
          </div>

          <div className="w-[30%] flex items-center justify-end gap-2 p-2">
            <SelectField
              defaultOption="Arriendo o Venta"
              id="ofert"
              options={ofertOptions}
              inputSize="sm"
              rounded="lg"
              onChange={handleInputChange}
            />
          </div>

          <Buton
            size="xs"
            borderWidth="none"
            rounded="lg"
            className="m-0"
            onClick={openModal}
          >
            <div className="flex items-center gap-1 cursor-pointer">
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
              <IoFilter size={18} className="text-white" />
              <Text colVariant="on" size="xs">
                {uiState.showSkill ? "Cerrar" : "Filtros"}
              </Text>
            </div>
          </Buton>

          <Buton
            size="sm"
            borderWidth="none"
            rounded="lg"
            onClick={handleClear}
          >
            <SiCcleaner
              className="text-gray-200 active:text-red-500"
              size={18}
            />
          </Buton>
        </div>

        {/* ===== FILTROS ===== */}
        {uiState.showSkill && (
          <>
            <div className="flex justify-around gap-3 p-2">
              {/* País */}
              <div className="relative w-full md:!w-[40%]">
                <SelectField
                  searchable
                  defaultOption="País"
                  id="country"
                  options={countryOptions}
                  inputSize="sm"
                  rounded="lg"
                  onChange={handleCountryChange}
                />
              </div>

              {/* Ciudad */}
              <div className="relative  w-full md:!w-[40%]">
                <SelectField
                  id="city"
                  inputSize="sm"
                  rounded="lg"
                  searchable
                  defaultOption="Ciudad"
                  options={[
                    ...(countryCityData
                      ?.find((c) => String(c.ids) === String(filters.country))
                      ?.city.map((city) => ({
                        value: String(city.id),
                        label: city.name,
                      })) || []),
                  ]}
                  value={filters.city}
                  onChange={handleCityChange}
                  disabled={!filters.country}
                />
              </div>

              {/* Ordenar */}
              <div className="relative w-full md:!w-[20%]">
                <SelectField
                  id="sort"
                  inputSize="sm"
                  helpText="Ordenar"
                  rounded="lg"
                  options={sortOptions}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* === SLIDERS === */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-cyan-800 rounded-xl shadow-sm">
              {/* Íconos */}
              <div className="flex flex-nowrap gap-3 overflow-x-auto scrollbar-hide">
                {iconData.map((item) => {
                  const isActive = item.label === filters.property;
                  return (
                    <Tooltip key={item.label} content={item.label}>
                      <div
                        className={`flex items-center justify-center w-12 h-12 rounded-lg border transition-all duration-200 cursor-pointer
                          ${
                            isActive
                              ? "bg-blue-100 border-blue-400 text-blue-600 shadow-md"
                              : "bg-cyan-800 border-gray-200 hover:bg-cyan-100 hover:shadow-sm"
                          }`}
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            selectedId: item.label,
                          }))
                        }
                      >
                        {item.icon}
                      </div>
                    </Tooltip>
                  );
                })}
              </div>

              {/* Precio */}
              <div className="flex flex-col items-center gap-4 bg-white p-2 rounded-xl flex-1 min-w-[280px]">
                <Text size="sm">
                  Precio: {filtersCash.minPrice.toLocaleString()} –{" "}
                  {filtersCash.maxPrice.toLocaleString()}+
                </Text>

                <Slider
                  range
                  min={0}
                  max={1000000}
                  step={10000}
                  value={[filtersCash.minPrice, filtersCash.maxPrice]}
                  onChange={handleSliderChangeCash}
                />

                <div className="flex gap-3 w-full max-w-md">
                  <InputField
                    id="minPrice"
                    type="number"
                    inputSize="sm"
                    rounded="lg"
                    value={filtersCash.minPrice}
                    onChange={handleInputChangeCash}
                  />
                  <InputField
                    id="maxPrice"
                    type="number"
                    inputSize="sm"
                    rounded="lg"
                    value={filtersCash.maxPrice}
                    onChange={handleInputChangeCash}
                  />
                </div>
              </div>

              {/* Área */}
              <div className="flex flex-col items-center gap-4 bg-white p-2 rounded-xl flex-1 min-w-[280px]">
                <Text size="sm">
                  Área: {filtersArea.minArea.toLocaleString()} –{" "}
                  {filtersArea.maxArea.toLocaleString()} m²
                </Text>

                <Slider
                  range
                  min={0}
                  max={1000}
                  step={10}
                  value={[filtersArea.minArea, filtersArea.maxArea]}
                  onChange={handleSliderChangeArea}
                />

                <div className="flex gap-3 w-full max-w-md">
                  <InputField
                    id="minArea"
                    type="number"
                    inputSize="sm"
                    rounded="lg"
                    value={filtersArea.minArea}
                    onChange={handleInputChangeCash}
                  />
                  <InputField
                    id="maxArea"
                    type="number"
                    inputSize="sm"
                    rounded="lg"
                    value={filtersArea.maxArea}
                    onChange={handleInputChangeCash}
                  />
                </div>
              </div>
            </div>

            {/* === FILTROS EXTRA === */}
            <div className="flex flex-col md:flex-row items-center gap-3 p-2">
              <SelectField
                defaultOption="# de parqueaderos"
                id="parking"
                options={parkingOptions}
                inputSize="sm"
                rounded="lg"
                onChange={handleInputChange}
              />
              <SelectField
                defaultOption="# de habitaciones"
                id="room"
                options={roomOptions}
                inputSize="sm"
                rounded="lg"
                onChange={handleInputChange}
              />
              <SelectField
                defaultOption="# de baños"
                id="restroom"
                options={restroomOptions}
                inputSize="sm"
                rounded="lg"
                onChange={handleInputChange}
              />
            </div>
          </>
        )}
      </section>

      {/* === LISTADO === */}
      {uiState.loading ? (
        <div className="flex justify-center items-center h-96">
          <Text colVariant="primary">Cargando inmuebles...</Text>
          <ImSpinner9 className="animate-spin text-base mr-2 text-blue-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mt-4">
          {filteredDataHollliday.map((e) => {
            const infodata = e.files.map((file) =>
              typeof file === "string" ? file : file.filename
            );

            const countryLabel =
              countryOptions.find((c) => c.value === String(e.country))
                ?.label || e.country;

            const cityLabel =
              countryCityData
                ?.find((c) => String(c.ids) === String(e.country))
                ?.city.find((c) => String(c.id) === String(e.city))?.name ||
              e.city;

            return (
              <Cardinfo
                key={e.id}
                area={e.area}
                property={e.property}
                images={infodata}
                country={countryLabel}
                city={cityLabel}
                neighborhood={e.neighborhood}
                ofert={e.ofert === "1" ? "Venta" : "Arriendo"}
                parking={e.parking}
                price={e.price}
                restroom={e.restroom}
                room={e.room}
                id={e.id}
                administration={e.administration}
                stratum={e.stratum}
                age={e.age}
                phone={e.phone}
                email={e.email}
                description={e.description}
                videos={e.videos}
                videosUrl={e.videoUrl}
                amenities={e.amenities}
                amenitiesResident={e.amenitiesResident}
                codigo={e.codigo}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

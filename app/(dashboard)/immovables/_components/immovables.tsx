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
import { SiCcleaner } from "react-icons/si";
import { FaClock, FaMoneyBillTransfer, FaStar } from "react-icons/fa6";
import { FaChartArea, FaHistory } from "react-icons/fa";
import RegisterOptions from "@/app/(panel)/my-new-immovable/_components/property/_components/regsiter-options";
import { useIconDataInmovable } from "./IconDataInmovable";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";

export default function Immovables() {
  const {
    handleCountryChange,
    handleClear,
    openModal,
    setFilters,
    setUiState,
    handleCityChange,
    filters,
    uiState,
    filteredDataHollliday,
    t,
  } = ImmovablesInfo();

  const {
    countryOptions,
    data: countryCityData,
    currencyOptions,
  } = useCountryCityOptions();

  const { parkingOptions, roomOptions, restroomOptions, ofertOptions } =
    RegisterOptions();

  const iconData = useIconDataInmovable();

  const sortOptions = [
    {
      label: `${t("destacados")}`,
      value: "highlight",
      icon: <FaStar className="inline mr-2" />,
    },
    {
      label: `${t("masrecientes")}`,
      value: "recent",
      icon: <FaClock className="inline mr-2" />,
    },
    {
      label: `${t("masantiguos")}`,
      value: "old",
      icon: <FaHistory className="inline mr-2" />,
    },
  ];

  return (
    <div>
      {/* ===== CABECERA ===== */}
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl max-h-[90vh] scrollbar-thin scrollbar-thumb-cyan-600 scrollbar-track-cyan-900">
        <div className="flex flex-col md:flex-row justify-start items-start md:!justify-between p-2 md:!items-center  gap-0 md:gap-10">
          <div className="w-full md:!w-[70%]">
            <Text colVariant="on" font="bold" size="lg" tKey={t("hogarideal")}>
              Encuentra tu hogar ideal
            </Text>
          </div>

          <div className="w-full md:!w-[30%] flex items-center justify-end gap-2 p-2">
            <SelectField
              tKeyDefaultOption={t("arriendoventa")}
              defaultOption="Arriendo o Venta"
              id="ofert"
              options={ofertOptions}
              inputSize="sm"
              rounded="lg"
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  ofert: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex gap-4">
            <Buton
              size="xs"
              borderWidth="none"
              rounded="lg"
              className="m-0"
              onClick={openModal}
            >
              <div className="flex items-center gap-1 cursor-pointer">
                <InputField
                  tKeyPlaceholder={t("buscarNoticia")}
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

            <Tooltip
              content="Limpiar"
              tKey={t("limpiar")}
              position="left"
              className="bg-gray-200"
            >
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
            </Tooltip>
          </div>
        </div>

        {/* ===== FILTROS ===== */}
        {uiState.showSkill && (
          <>
            <div className="flex flex-col md:!flex-row justify-around gap-3 p-2">
              {/* País */}
              <div className="relative w-full md:!w-[40%]">
                <SelectField
                  searchable
                  tKeyHelpText={t("pais")}
                  tKeyDefaultOption={t("pais")}
                  sizeHelp="xs"
                  helpText="País"
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
                  tKeyHelpText={t("ciudad")}
                  tKeyDefaultOption={t("ciudad")}
                  sizeHelp="xs"
                  helpText="País"
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
                  tKeyHelpText={t("ordenar")}
                  tKeyDefaultOption={t("ordenar")}
                  helpText="Ordenar"
                  defaultOption="Ordenar"
                  rounded="lg"
                  sizeHelp="xs"
                  options={sortOptions}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setFilters((prev) => ({
                      ...prev,
                      sort: e.target.value, // ✅ es string
                    }))
                  }
                />
              </div>
            </div>

            {/* === FILTROS EXTRA === */}
            <div className="flex flex-col md:!flex-row items-center gap-3 p-2">
              <SelectField
                defaultOption="Tipo de moneda"
                id="currency"
                options={currencyOptions}
                inputSize="sm"
                rounded="lg"
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    currency: e.target.value,
                  }))
                }
              />

              {/* Parqueaderos */}
              <SelectField
                defaultOption="# de parqueaderos"
                id="parking"
                options={parkingOptions}
                inputSize="sm"
                rounded="lg"
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    parking: e.target.value,
                  }))
                }
              />

              {/* Habitaciones */}
              <SelectField
                defaultOption="# de habitaciones"
                id="room"
                options={roomOptions}
                inputSize="sm"
                rounded="lg"
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    room: e.target.value,
                  }))
                }
              />

              {/* Baños */}
              <SelectField
                defaultOption="# de baños"
                id="restroom"
                options={restroomOptions}
                inputSize="sm"
                rounded="lg"
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    restroom: e.target.value,
                  }))
                }
              />
            </div>

            <div className="flex flex-nowrap gap-1 md:!gap-24 justify-center overflow-x-auto scrollbar-hide">
              {iconData.map((item) => {
                const isActive = item.label === filters.property;
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col items-center justify-center w-auto p-2 h-14 rounded-lg border transition-all duration-200 cursor-pointer
                          ${
                            isActive
                              ? "bg-blue-100 border-blue-400 text-blue-600 shadow-md"
                              : "bg-cyan-800 border-gray-200 hover:bg-cyan-100 hover:shadow-sm"
                          }`}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        property: item.id,
                      }))
                    }
                  >
                    {item.icon}
                    <Text size="xs" colVariant="on" font="bold">
                      {item.label}
                    </Text>
                  </div>
                );
              })}
            </div>

            {/* === SLIDERS === */}
            <div className="flex flex-wrap items-center gap-4 p-4 bg-cyan-800 rounded-xl shadow-sm">
              {/* Íconos */}

              {/* Precio */}
              <div className="flex flex-col items-center gap-4 bg-white p-2 rounded-xl flex-1 min-w-[280px]">
                <Text size="sm" tKey={t("precio")}>
                  Precio:{" "}
                  <Text as="span" size="sm">
                    {Number(filters.minPrice || 0).toLocaleString()} –{" "}
                    {Number(filters.maxPrice || 0).toLocaleString()}+
                  </Text>
                </Text>

                <Slider
                  range
                  min={0}
                  max={100000000000}
                  step={10000}
                  value={[Number(filters.minPrice), Number(filters.maxPrice)]}
                  onChange={(value) => {
                    if (Array.isArray(value)) {
                      const [min, max] = value;
                      setFilters((prev) => ({
                        ...prev,
                        minPrice: String(min),
                        maxPrice: String(max),
                      }));
                    }
                  }}
                />

                <div className="flex flex-col md:!flex-row gap-3 w-full max-w-md">
                  <InputField
                    id="minPrice"
                    prefixElement={<FaMoneyBillTransfer size={15} />}
                    type="number"
                    inputSize="sm"
                    rounded="lg"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minPrice: e.target.value,
                      }))
                    }
                  />
                  <InputField
                    id="maxPrice"
                    prefixElement={<FaMoneyBillTransfer size={15} />}
                    type="number"
                    inputSize="sm"
                    rounded="lg"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxPrice: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              {/* Área */}
              <div className="flex flex-col items-center gap-4 bg-white p-2 rounded-xl flex-1 min-w-[280px]">
                <Text size="sm" tKey={t("areal")}>
                  Área:{" "}
                  <Text as="span" size="sm">
                    {Number(filters.minArea || 0).toLocaleString()} –{" "}
                    {Number(filters.maxArea || 0).toLocaleString()} m²
                  </Text>
                </Text>

                <Slider
                  range
                  min={0}
                  max={1000000}
                  step={10000}
                  value={[Number(filters.minArea), Number(filters.maxArea)]}
                  onChange={(value) => {
                    if (Array.isArray(value)) {
                      const [min, max] = value;
                      setFilters((prev) => ({
                        ...prev,
                        minArea: String(min),
                        maxArea: String(max),
                      }));
                    }
                  }}
                />

                <div className="flex flex-col md:!flex-row gap-3 w-full max-w-md">
                  <InputField
                    id="minArea"
                    type="number"
                    prefixElement={<FaChartArea size={15} />}
                    inputSize="sm"
                    rounded="lg"
                    value={filters.minArea}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        minArea: e.target.value,
                      }))
                    }
                  />
                  <InputField
                    id="maxArea"
                    type="number"
                    prefixElement={<FaChartArea size={15} />}
                    inputSize="sm"
                    rounded="lg"
                    value={filters.maxArea}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        maxArea: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
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
          {filteredDataHollliday.length > 0 ? (
            filteredDataHollliday.map((e) => {
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
            })
          ) : (
            <div
              className="col-span-full flex flex-col justify-center items-center py-10 cursor-pointer hover:bg-cyan-700 rounded-lg transition-colors"
              onClick={() => {
                handleClear();
                setUiState((prev) => ({ ...prev, search: "" }));
              }}
            >
              <Text
                size="md"
                colVariant="on"
                className="text-gray-200 mb-2 text-center"
              >
                🫤 No hay datos en su búsqueda
              </Text>
              <Text
                size="sm"
                colVariant="on"
                className="text-gray-400 text-center"
              >
                Haga clic aquí para remover los filtros activos o reiniciar la
                búsqueda 🔄
              </Text>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
import { IoFilter, IoSearchCircle } from "react-icons/io5";
import HolidayInfo from "./holiday-info";
import Cardinfo from "./card-holiday/card-info";
import { useCountryCityOptions } from "../../registers/_components/register-option";
import { iconData } from "./constants";
import { FaClock, FaHistory, FaStar } from "react-icons/fa";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { SiCcleaner } from "react-icons/si";
import { MdOutlinePets, MdOutlineSmokeFree } from "react-icons/md";
import { FaCarAlt } from "react-icons/fa";
import { BiSolidParty } from "react-icons/bi";
import { FaMoneyBillTransfer } from "react-icons/fa6";
import { ToggleSwitch } from "./toggleSwitch";
import { Filters } from "../services/hollidayService";

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
    handleCityChange,
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

  const switchConfigs = [
    {
      name: "petsAllowed",
      trueText: "Acepta mascotas",
      falseText: "No acepta mascotas",
      Icon: MdOutlinePets,
    },
    {
      name: "parking",
      trueText: "Con parqueadero",
      falseText: "Sin parqueadero",
      Icon: FaCarAlt,
    },
    {
      name: "eventsAllowed",
      trueText: "Permite evento",
      falseText: "No permite evento",
      Icon: BiSolidParty,
    },
    {
      name: "smokingAllowed",
      trueText: "Permite fumar",
      falseText: "No permite fumar",
      Icon: MdOutlineSmokeFree,
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
          <div className="w-[70%]">
            <Title as="h5" colVariant="on" font="bold" size="xs">
              🏖️ Explora y reserva tu próximo alojamiento
            </Title>
          </div>
          <div className="w-[30%] flex items-center justify-end gap-2 p-2">
            <Buton
              size="sm"
              rounded="lg"
              borderWidth="none"
              className="m-0"
              onClick={() => {
                setFilters({
                  property: "",
                  minPrice: "",
                  maxPrice: "",
                  country: "",
                  city: "",
                });
                handleClear();
              }}
            >
              <SiCcleaner
                className="text-gray-200 active:text-red-500"
                size={18}
              />
            </Buton>

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
                  {uiState.showSkill === true ? "Cerrar" : "Filtros"}
                </Text>
              </div>
            </Buton>
          </div>
        </div>
        {uiState.showSkill && (
          <section>
            <div className="flex flex-col md:!flex-row gap-3 p-2">
              {/* País */}
              <div className="relative w-full md:!w-[40%]">
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
              <div className="relative  w-full md:!w-[40%]">
                <SelectField
                  id="city"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="lg"
                  searchable
                  helpText="Seleccionar ciudad"
                  options={[
                    ...(data
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

              <div className="relative  w-full md:!w-[10%]">
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
              <div className="relative  w-full md:!w-[10%]">
                <SelectField
                  id="sort"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="lg"
                  options={sortOptions}
                  value={filters.sort}
                  onChange={handleInputChange}
                ></SelectField>
              </div>
            </div>
            {/* 🔹 Buscador */}
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
                    <Text size="xs" colVariant="on" className="text-center">
                      {item.label}
                    </Text>
                  )}
                </div>
              ))}
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
          </section>
        )}

        {uiState.showSkill && (
          <div className="p-4 flex flex-col md:!flex-row w-full items-center gap-4 bg-cyan-900 rounded-lg mt-2 overflow-y-auto max-h-[400px]">
            <div className="flex flex-col md:!flex-row p-2 flex-1 min-w-[250px] gap-3 border rounded-lg shadow-sm">
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
              <div className="flex flex-col md:!flex-row gap-3 md:!mt-4">
                <div className="flex-1">
                  <InputField
                    prefixElement={<FaMoneyBillTransfer size={15} />}
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
                    prefixElement={<FaMoneyBillTransfer size={15} />}
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

            <div className="flex flex-row flex-1 flex-wrap justify-between items-center gap-4 text-white">
              {switchConfigs.map((config) => (
                <ToggleSwitch<Filters>
                  key={config.name}
                  value={filters[config.name]}
                  name={config.name as keyof Filters}
                  onToggle={handleSwitchChange}
                  trueText={config.trueText}
                  falseText={config.falseText}
                  Icon={config.Icon}
                />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 🔹 Cards */}
      <div className="grid gap-2 mt-4 grid-cols-1 sm:grid-cols-6 2xl:grid-cols-8">
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

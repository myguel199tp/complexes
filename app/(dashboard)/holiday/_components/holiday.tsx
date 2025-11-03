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
import { useIconData } from "./constants";
import { FaClock, FaHistory, FaStar } from "react-icons/fa";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { SiCcleaner } from "react-icons/si";
import { MdOutlinePets, MdOutlineSmokeFree } from "react-icons/md";
import { FaCarAlt } from "react-icons/fa";
import { BiSolidParty } from "react-icons/bi";
import { FaMoneyBillTransfer } from "react-icons/fa6";
// import { ToggleSwitch } from "./toggleSwitch";
// import { Filters } from "../services/hollidayService";
import { TriStateSwitch } from "./TriStateSwitch";
import { TriStateToggleSwitch } from "./toggleSwitch";

export default function Holiday() {
  const {
    filteredDataHollliday,
    openModal,
    // handleSwitchChange,
    uiState,
    setUiState,
    toggleSubOptions,
    handleCountryChange,
    handleClear,
    handleCityChange,
    setFilters,
    activeLabel,
    filters,
    t,
  } = HolidayInfo();

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

  const switchConfigs = [
    {
      name: "petsAllowed",
      trueText: `${t("mascota")}`,
      falseText: `${t("nomascota")}`,
      Icon: MdOutlinePets,
    },
    {
      name: "parking",
      trueText: `${t("conparqueo")}`,
      falseText: `${t("noParqueo")}`,
      Icon: FaCarAlt,
    },
    {
      name: "eventsAllowed",
      trueText: `${t("permiteevento")}`,
      falseText: `${t("noEvento")}`,
      Icon: BiSolidParty,
    },
    {
      name: "smokingAllowed",
      trueText: `${t("permitefumar")}`,
      falseText: `${t("noFumar")}`,
      Icon: MdOutlineSmokeFree,
    },
  ];

  const { countryOptions, data } = useCountryCityOptions();

  const iconData = useIconData();

  return (
    <div>
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className="flex flex-col md:flex-row justify-between p-2 items-center gap-0 md:gap-10">
          <div className="w-[70%]">
            <Title
              as="h5"
              colVariant="on"
              font="bold"
              size="xs"
              tKey={t("explora")}
            >
              🏖️ Explora y reserva tu próximo alojamiento
            </Title>
          </div>
          <div className="w-full md:!w-[30%] flex items-center justify-end gap-2 p-2 ">
            <InputField
              placeholder="Buscar"
              tKeyPlaceholder={t("buscarNoticia")}
              rounded="lg"
              inputSize="sm"
              prefixElement={<IoSearchCircle size={15} />}
              value={uiState.search}
              onChange={(e) =>
                setUiState((prev) => ({ ...prev, search: e.target.value }))
              }
            />
            <Buton
              size="xs"
              borderWidth="none"
              rounded="lg"
              className="m-0"
              onClick={openModal}
            >
              <div className="flex flex-col-reverse items-center gap-1 cursor-pointer">
                <IoFilter size={18} className="text-white" />
                <Text colVariant="on" size="xs">
                  {uiState.showSkill === true
                    ? `${t("cerrar")}`
                    : `${t("filtros")}`}
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
                rounded="lg"
                borderWidth="none"
                className="m-0"
                onClick={() => {
                  handleClear();
                }}
              >
                <SiCcleaner
                  className="text-gray-200 active:text-red-500"
                  size={18}
                />
              </Buton>
            </Tooltip>
          </div>
        </div>
        {uiState.showSkill && (
          <section>
            <div className="flex flex-col md:!flex-row gap-3 p-2">
              {/* País */}
              <div className="relative w-full md:!w-[40%]">
                <SelectField
                  tKeyDefaultOption={t("pais")}
                  tKeyHelpText={t("pais")}
                  searchable
                  defaultOption="Pais"
                  helpText="Pais"
                  sizeHelp="xs"
                  id="ofert"
                  options={countryOptions}
                  inputSize="sm"
                  rounded="lg"
                  onChange={handleCountryChange}
                />
              </div>

              {/* Ciudad */}
              <div className="relative  w-full md:!w-[40%]">
                <SelectField
                  tKeyDefaultOption={t("ciudad")}
                  tKeyHelpText={t("ciudad")}
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
                  tKeyPlaceholder={t("cantiad")}
                  tKeyHelpText={t("cantiad")}
                  helpText="Cuantos son"
                  sizeHelp="xs"
                  inputSize="sm"
                  placeholder="Cuantos son"
                  rounded="lg"
                  id="maxGuests"
                  type="text"
                  value={filters.maxGuests}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const onlyNumbers = e.target.value.replace(/[^0-9]/g, ""); // elimina todo lo que no sea número
                    setFilters((prev) => ({
                      ...prev,
                      maxGuests: onlyNumbers,
                    }));
                  }}
                />
              </div>
              <div className="relative  w-full md:!w-[10%]">
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
                      sort: e.target.value,
                    }))
                  }
                />
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
                <Text size="md" tKey={t("subcategoria")}>
                  Subcategorías de{" "}
                  <Text as="span" size="md" className="font-semibold mb-2">
                    {activeLabel}
                  </Text>
                </Text>

                <div className="flex flex-wrap gap-2">
                  {(() => {
                    const activeItem = iconData.find(
                      (item) => item.label === activeLabel
                    );

                    if (!activeItem?.subOptions) {
                      return (
                        <Text
                          size="sm"
                          className="text-gray-500"
                          tKey={t("nosubcategoria")}
                        >
                          No hay subcategorías disponibles.
                        </Text>
                      );
                    }

                    return activeItem.subOptions.map((sub, i) => (
                      <Button
                        key={i}
                        size="sm"
                        rounded="lg"
                        onClick={() =>
                          setFilters((prev) => ({
                            ...prev,
                            property: String(sub.value), // <-- enviamos el value
                          }))
                        }
                        colVariant={
                          filters.property === String(sub.value)
                            ? "default"
                            : "warning"
                        }
                      >
                        {sub.title}
                      </Button>
                    ));
                  })()}
                </div>
              </div>
            )}
          </section>
        )}

        {uiState.showSkill && (
          <div className="p-4 flex flex-col md:!flex-row w-full items-center gap-4 bg-cyan-900 rounded-lg mt-2 overflow-y-auto max-h-[400px]">
            <div className="flex flex-col md:!flex-row p-2 bg-white flex-1 min-w-[250px] gap-3 border rounded-lg shadow-sm">
              <div className="w-full max-w-md p-4 ">
                <Text size="xs" colVariant="default">
                  {Number(filters.minPrice || 0).toLocaleString()} –{" "}
                  {Number(filters.maxPrice || 0).toLocaleString()}+
                </Text>

                <Slider
                  range
                  min={0}
                  max={1000000}
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
              </div>
              <div className="flex flex-col md:!flex-row gap-3 md:!mt-4">
                <div className="flex-1">
                  <InputField
                    prefixElement={<FaMoneyBillTransfer size={15} />}
                    id="minPrice"
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
                </div>

                <div className="flex-1">
                  <InputField
                    prefixElement={<FaMoneyBillTransfer size={15} />}
                    id="maxPrice"
                    inputSize="sm"
                    rounded="lg"
                    type="number"
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
            </div>

            <div className="flex flex-row flex-1 flex-wrap justify-between items-center gap-4 text-white">
              {switchConfigs.map((config) => (
                <TriStateToggleSwitch<Filters>
                  key={config.name}
                  value={
                    filters[config.name] === true
                      ? "true"
                      : filters[config.name] === false
                      ? "false"
                      : null
                  }
                  name={config.name as keyof Filters}
                  onToggle={(key, newValue) => {
                    setFilters((prev) => ({
                      ...prev,
                      [key]:
                        newValue === "true"
                          ? true
                          : newValue === "false"
                          ? false
                          : undefined, // estado vacío (mostrar ambos)
                    }));
                  }}
                  trueText={config.trueText}
                  falseText={config.falseText}
                  Icon={config.Icon}
                />

                // <ToggleSwitch<Filters>
                //   key={config.name}
                //   value={filters[config.name]}
                //   name={config.name as keyof Filters}
                //   onToggle={handleSwitchChange}
                //   trueText={config.trueText}
                //   falseText={config.falseText}
                //   Icon={config.Icon}
                // />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 🔹 Cards */}
      <div className="grid gap-2 mt-4 grid-cols-1 sm:!grid-cols-4 md:!grid-cols-6 2xl:grid-cols-8">
        {filteredDataHollliday.length === 0 ? (
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
              tKey={t("noDatosBusquerda")}
            >
              🫤 No hay datos en su búsqueda
            </Text>
            <Text
              size="sm"
              colVariant="on"
              className="text-gray-400 text-center"
              tKey={t("mensajeClic")}
            >
              Haga clic aquí para remover los filtros activos o reiniciar la
              búsqueda 🔄
            </Text>
          </div>
        ) : (
          filteredDataHollliday.map((e) => {
            const infodata = e.files.map((file) =>
              typeof file === "string" ? file : file.filename
            );

            const countryLabel =
              countryOptions.find((c) => c.value === String(e.country))
                ?.label || e.country;

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
          })
        )}
      </div>
    </div>
  );
}

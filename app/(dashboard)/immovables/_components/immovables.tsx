"use client";
import {
  Buton,
  Button,
  InputField,
  SelectField,
  Text,
  Tooltip,
} from "complexes-next-components";
import React, { useState } from "react";
import { FaBuilding, FaHome } from "react-icons/fa";
import { FaShop } from "react-icons/fa6";
import { IoFilter } from "react-icons/io5";
import {
  MdBedroomParent,
  MdLocalConvenienceStore,
  MdOutlineApartment,
  MdOutlineSpaceDashboard,
} from "react-icons/md";
import { SiLibreofficecalc } from "react-icons/si";
import Cardinfo from "./card-immovables/card-info";
import ImmovablesInfo from "./immovables-info";

export default function Immovables() {
  const {
    filteredData,
    handleInputChange,
    handleToggleFilterOptions,
    openModal,
    setFilters,
    setUiState,
    filters,
    uiState,
    ofertOptions,
    parkingOptions,
    restroomOptions,
    roomOptions,
    stratumOptions,
  } = ImmovablesInfo();

  const [activeFilters, setActiveFilters] = useState([
    "Precio desde COP",
    "Precio hasta COP",
    "Area desde M2",
    "Area hasta M2",
  ]);

  const filterOptions = [
    "Estrato",
    "# de parqueaderos",
    "# de habitaciones",
    "# de baños",
  ];

  const handleAddFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const iconData = [
    {
      id: "1",
      label: "Apartamento",
      icon: <FaBuilding size={25} className="text-white" />,
    },
    {
      id: "2",
      label: "Casa",
      icon: <FaHome size={25} className="text-white" />,
    },
    {
      id: "3",
      label: "Local",
      icon: <FaShop size={25} className="text-white" />,
    },
    {
      id: "4",
      label: "Oficina",
      icon: <SiLibreofficecalc size={25} className="text-white" />,
    },
    {
      id: "5",
      label: "Bodega",
      icon: <MdLocalConvenienceStore size={25} className="text-white" />,
    },
    {
      id: "6",
      label: "Lote",
      icon: <MdOutlineSpaceDashboard size={25} className="text-white" />,
    },
    {
      id: "7",
      label: "Dormitorio",
      icon: <MdBedroomParent size={25} className="text-white" />,
    },
    {
      id: "8",
      label: "Aparta estudio",
      icon: <MdOutlineApartment size={25} className="text-white" />,
    },
  ];

  return (
    <div>
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className="flex flex-col md:!flex-row justify-center items-center gap-0 md:!gap-10">
          <Text className="text-white" font="bold" size="lg">
            _Tu siguiente hogar_
          </Text>

          <SelectField
            className="bg-transparent text-gray-400"
            defaultOption="Arriendo o Venta"
            id="ofert"
            options={ofertOptions}
            inputSize="lg"
            rounded="md"
            onChange={handleInputChange}
          />

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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setUiState((prev) => ({ ...prev, search: e.target.value }))
            }
          />
        </div>

        <div className="grid p-3 grid-cols-10 gap-6 mt-1 overflow-x-auto md:overflow-x-visible whitespace-nowrap scroll-smooth">
          {iconData.map((item) => {
            const isActive = item.id === filters.selectedId;
            return (
              <div key={item.id}>
                <Tooltip content={item.label}>
                  <div
                    className={
                      "flex flex-col items-center justify-center cursor-pointer p-2 rounded-lg " +
                      (isActive
                        ? "bg-blue-200 ring-2 ring-blue-400"
                        : "hover:bg-gray-200")
                    }
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        selectedId: item.id,
                      }))
                    }
                  >
                    {item.icon}
                  </div>
                </Tooltip>
              </div>
            );
          })}
          <Button
            size="sm"
            rounded="lg"
            onClick={() => setFilters((prev) => ({ ...prev, selectedId: "" }))}
          >
            Limpiar
          </Button>
        </div>

        {uiState.showSkill && (
          <div className="p-4 flex items-center gap-4">
            {activeFilters.map((filter, index) => {
              switch (filter) {
                case "Precio desde COP":
                  return (
                    <InputField
                      key={index}
                      className="bg-transparent text-gray-300"
                      placeholder="Precio desde COP"
                      id="copInit"
                      type="number"
                      value={filters.copInit}
                      onChange={handleInputChange}
                    />
                  );
                case "Precio hasta COP":
                  return (
                    <InputField
                      key={index}
                      className="bg-transparent text-gray-300"
                      placeholder="Precio hasta COP"
                      id="copEnd"
                      type="number"
                      value={filters.copEnd}
                      onChange={handleInputChange}
                    />
                  );
                case "Area desde M2":
                  return (
                    <InputField
                      key={index}
                      className="bg-transparent text-gray-300"
                      placeholder="Area desde M2"
                      id="areaInit"
                      type="number"
                      value={filters.areaInit}
                      onChange={handleInputChange}
                    />
                  );
                case "Area hasta M2":
                  return (
                    <InputField
                      key={index}
                      className="bg-transparent text-gray-300"
                      placeholder="Area Hasta M2"
                      id="areaEnd"
                      type="number"
                      value={filters.areaEnd}
                      onChange={handleInputChange}
                    />
                  );
                case "Estrato":
                  return (
                    <SelectField
                      key={index}
                      className="bg-transparent text-gray-400"
                      defaultOption="Estrato"
                      id="stratum"
                      options={stratumOptions}
                      inputSize="lg"
                      rounded="md"
                      onChange={handleInputChange}
                    />
                  );
                case "# de parqueaderos":
                  return (
                    <SelectField
                      key={index}
                      className="bg-transparent text-gray-400"
                      defaultOption="# de parqueaderos"
                      id="parking"
                      options={parkingOptions}
                      inputSize="lg"
                      rounded="md"
                      onChange={handleInputChange}
                    />
                  );
                case "# de habitaciones":
                  return (
                    <SelectField
                      key={index}
                      className="bg-transparent text-gray-400"
                      defaultOption="# de habitaciones"
                      id="room"
                      options={roomOptions}
                      inputSize="lg"
                      rounded="md"
                      onChange={handleInputChange}
                    />
                  );
                case "# de baños":
                  return (
                    <SelectField
                      key={index}
                      className="bg-transparent text-gray-400"
                      defaultOption="# de baños"
                      id="restroom"
                      options={restroomOptions}
                      inputSize="lg"
                      rounded="md"
                      onChange={handleInputChange}
                    />
                  );
                default:
                  return null;
              }
            })}

            <div className="block items-center">
              <Buton
                size="sm"
                colVariant="primary"
                borderWidth="thin"
                rounded="lg"
                onClick={handleToggleFilterOptions}
              >
                {uiState.showFilterOptions ? "- filtros" : "+ filtros"}
              </Buton>
              {uiState.showFilterOptions && (
                <div className="mt-1 bg-white p-2 rounded-md shadow-lg">
                  <ul>
                    {filterOptions.map((option, i) => (
                      <li key={i} className="py-1">
                        <Button
                          className="bg-cyan-800"
                          size="sm"
                          onClick={() => handleAddFilter(option)}
                        >
                          {option}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </section>

      {uiState.loading ? (
        <div className="flex justify-center items-center h-96">
          <Text colVariant="primary">Cargando inmuebles...</Text>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:!grid-cols-4 gap-2 h-screen mt-4">
          {filteredData.map((e) => {
            const infodata = e.files.map((file) =>
              typeof file === "string" ? file : file.filename
            );
            return (
              <Cardinfo
                key={e._id}
                area={e.area}
                property={e.property}
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
      )}
    </div>
  );
}

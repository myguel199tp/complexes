"use client";
import {
  Buton,
  Button,
  InputField,
  SelectField,
  Text,
  Tooltip,
} from "complexes-next-components";
import React, { useEffect, useState } from "react";
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
import { InmovableResponses } from "../services/response/inmovableResponses";
import { immovableService } from "../services/inmovableService";
import RegisterOptions from "@/app/(panel)/my-new-immovable/_components/property/_components/regsiter-options";

export default function Immovables() {
  const [formState, setFormState] = useState({
    ofert: "",
    room: "",
    restroom: "",
    stratum: "",
    age: "",
    copInit: "",
    copEnd: "",
    areaInit: "",
    areaEnd: "",
    parking: "",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const [data, setData] = useState<InmovableResponses[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showSkill, setShowSkill] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string>("");
  const [showFilterOptions, setShowFilterOptions] = useState(false);
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

  const handleToggleFilterOptions = () => {
    setShowFilterOptions(!showFilterOptions);
  };

  const handleAddFilter = (filter) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };
  const {
    ofertOptions,
    parkingOptions,
    restroomOptions,
    roomOptions,
    stratumOptions,
  } = RegisterOptions();

  const openModal = () => {
    if (showSkill === false) {
      setShowSkill(true);
    }

    if (showSkill === true) {
      setShowSkill(false);
    }
  };

  // Data de íconos
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const filters = {
          ofert: formState.ofert,
          stratum: formState.stratum,
          room: formState.room,
          restroom: formState.restroom,
          age: formState.age,
          parking: formState.parking,
          property: selectedId,
          minPrice: formState.copInit,
          maxPrice: formState.copEnd,
          minArea: formState.areaInit,
          maxArea: formState.areaEnd,
        };
        const result = await immovableService(filters);
        setData(result);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedId, formState]);

  const filteredData = data.filter((item) =>
    [item.city, item.neighborhood, item.description].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

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
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
          />
        </div>

        <div className="grid p-3 grid-cols-10 gap-6 mt-1 overflow-x-auto md:overflow-x-visible whitespace-nowrap scroll-smooth">
          {iconData.map((item) => {
            const isActive = item.id === selectedId;
            return (
              <>
                <div key={item.id}>
                  <Tooltip content={item.label}>
                    <div
                      className={
                        "flex flex-col items-center justify-center cursor-pointer p-2 rounded-lg " +
                        (isActive
                          ? "bg-blue-200 ring-2 ring-blue-400"
                          : "hover:bg-gray-200")
                      }
                      onClick={() => setSelectedId(item.id)}
                    >
                      {item.icon}
                    </div>
                  </Tooltip>
                </div>
              </>
            );
          })}
          <Button size="sm" rounded="lg" onClick={() => setSelectedId("")}>
            Limpiar
          </Button>
        </div>
        {showSkill && (
          <div className="p-4 flex items-center gap-4 flex-wrap">
            {/* Mostrar los filtros activos */}
            {activeFilters.map((filter, index) => {
              if (filter === "Precio desde COP") {
                return (
                  <div className="flex items-center" key={index}>
                    <InputField
                      className="bg-transparent text-gray-300"
                      placeholder="Precio desde COP"
                      id="copInit"
                      type="number"
                      value={formState.copInit}
                      onChange={handleInputChange}
                    />
                  </div>
                );
              } else if (filter === "Precio hasta COP") {
                return (
                  <div className="flex items-center" key={index}>
                    <InputField
                      className="bg-transparent text-gray-300"
                      placeholder="Precio hasta COP"
                      id="copEnd"
                      type="number"
                      value={formState.copEnd}
                      onChange={handleInputChange}
                    />
                  </div>
                );
              } else if (filter === "Area desde M2") {
                return (
                  <div className="flex items-center" key={index}>
                    <InputField
                      className="bg-transparent text-gray-300"
                      placeholder="Area desde M2"
                      id="areaInit"
                      type="number"
                      value={formState.areaInit}
                      onChange={handleInputChange}
                    />
                  </div>
                );
              } else if (filter === "Area hasta M2") {
                return (
                  <div className="flex items-center" key={index}>
                    <InputField
                      className="bg-transparent text-gray-300"
                      placeholder="Area Hasta M2"
                      id="areaEnd"
                      type="number"
                      value={formState.areaEnd}
                      onChange={handleInputChange}
                    />
                  </div>
                );
              } else if (filter === "Estrato") {
                return (
                  <SelectField
                    className="bg-transparent text-gray-400"
                    defaultOption="Estrato"
                    id="stratum"
                    options={stratumOptions}
                    inputSize="lg"
                    rounded="md"
                    onChange={handleInputChange}
                    key={index}
                  />
                );
              } else if (filter === "# de parqueaderos") {
                return (
                  <SelectField
                    className="bg-transparent text-gray-400"
                    defaultOption="# de parqueaderos"
                    id="parking"
                    options={parkingOptions}
                    inputSize="lg"
                    rounded="md"
                    onChange={handleInputChange}
                    key={index}
                  />
                );
              } else if (filter === "# de habitaciones") {
                return (
                  <SelectField
                    className="bg-transparent text-gray-400"
                    defaultOption="# de habitaciones"
                    id="room"
                    options={roomOptions}
                    inputSize="lg"
                    rounded="md"
                    onChange={handleInputChange}
                    key={index}
                  />
                );
              } else if (filter === "# de baños") {
                return (
                  <SelectField
                    className="bg-transparent text-gray-400"
                    defaultOption="# de baños"
                    id="restroom"
                    options={restroomOptions}
                    inputSize="lg"
                    rounded="md"
                    onChange={handleInputChange}
                    key={index}
                  />
                );
              }
              // Puedes agregar más filtros aquí si es necesario
            })}

            {/* Botón para ver más filtros */}
            <div className="block items-center">
              <Buton
                size="sm"
                colVariant="primary"
                borderWidth="thin"
                rounded="lg"
                onClick={handleToggleFilterOptions}
              >
                {showFilterOptions ? "Ver menos filtros" : "Ver más filtros"}
              </Buton>
              {showFilterOptions && (
                <div className="mt-1 bg-white p-2 rounded-md shadow-lg">
                  <ul>
                    {filterOptions.map((option, index) => (
                      <li key={index} className="py-1">
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

      {loading ? (
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

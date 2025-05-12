"use client";
import { Buton, Button, InputField, Text } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { FaBuilding, FaHome } from "react-icons/fa";
import { IoFilter } from "react-icons/io5";
import { MdBedroomParent } from "react-icons/md";
import { PiFarmFill } from "react-icons/pi";
import Cardinfo from "./card-holiday/card-info";
import { hollidaysService } from "../services/hollidayService";
import { HollidayResponses } from "../services/response/holidayResponses";

export default function Holiday() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [search, setSearch] = useState<string>("");
  const [showSkill, setShowSkill] = useState<boolean>(false);
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

  const [data, setData] = useState<HollidayResponses[]>([]);
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const [activeFilters, setActiveFilters] = useState([
    "Precio desde COP",
    "Precio hasta COP",
  ]);

  const filterOptions = [
    "Estrato",
    "# de parqueaderos",
    "# de habitaciones",
    "# de baños",
  ];

  const handleAddFilter = (filter) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const handleToggleFilterOptions = () => {
    setShowFilterOptions(!showFilterOptions);
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await hollidaysService();
      setData(result);
    };

    fetchData();
  }, []);

  const iconData = [
    {
      label: "Apartamento",
      icon: <FaBuilding size={25} className="text-white" />,
      subOptions: ["apartamento", "Penthouse", "Loft", "Estudio", "duplex"],
    },
    {
      label: "Casa",
      icon: <FaHome size={25} className="text-white" />,
      subOptions: [
        "Casa",
        "Casa de campo",
        "Casa pequeña",
        "Casa rural",
        "Casa en arbol",
        "Casa rodante",
        "Casa cueva",
        "Chalet",
        "Villa",
        "Riads",
      ],
    },
    {
      label: "Granja",
      icon: <PiFarmFill size={25} className="text-white" />,
      subOptions: ["Finca", "Eco-granja", "Hacienda"],
    },
    {
      label: "Alternativos",
      icon: <MdBedroomParent size={25} className="text-white" />,
      subOptions: ["Glamping", "Bungalow", "Tipis", "Yutras", "Eco-lodges"],
    },
    {
      label: "Compartidos",
      icon: <MdBedroomParent size={25} className="text-white" />,
      subOptions: ["Habitacion", "Posada"],
    },
    {
      label: "Vivienda móil",
      icon: <MdBedroomParent size={25} className="text-white" />,
      subOptions: [
        "Campers",
        "Autocaravana",
        "Barcos",
        "Veleros",
        "Yates",
        "Rodante",
      ],
    },
  ];

  const toggleSubOptions = (label: string) => {
    setActiveLabel((prev) => (prev === label ? null : label));
  };

  const filteredData = data.filter((item) =>
    [item.city, item.neigborhood, item.description].some((field) =>
      field.toLowerCase().includes(search.toLowerCase())
    )
  );

  const openModal = () => {
    if (showSkill === false) {
      setShowSkill(true);
    }

    if (showSkill === true) {
      setShowSkill(false);
    }
  };

  return (
    <div>
      <section className="sticky top-0 z-10 bg-cyan-800 rounded-xl">
        <div className=" flex flex-col md:!flex-row justify-center p-2 items-center gap-0 md:!gap-10 ">
          <Text className="text-white" font="bold" size="lg">
            _Tu siguente destino_
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
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
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
                  <span
                    key={i}
                    className="bg-orange-500 text-white px-3 py-1 rounded-full text-sm cursor-pointer hover:bg-orange-200"
                  >
                    {sub}
                  </span>
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
      <div className="grid grid-cols-1 md:!grid-cols-4 gap-2 h-screen mt-4">
        {filteredData.map((e) => {
          const infodata = e.files.map((file) =>
            typeof file === "string" ? file : file.filename
          );
          return (
            <Cardinfo
              key={e._id}
              files={infodata}
              city={e.city}
              neigborhood={e.neigborhood}
              parking={e.parking}
              price={e.price}
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

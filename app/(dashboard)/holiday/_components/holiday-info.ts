import React, { useEffect, useState } from "react";
import { HollidayResponses } from "../services/response/holidayResponses";
import { hollidaysService } from "../services/hollidayService";

interface Formstate {
  ofert: string;
  room: string;
  restroom: string;
  stratum: string;
  age: string;
  copInit: string;
  copEnd: string;
  areaInit: string;
  areaEnd: string;
  parking: string;
  showSkill: boolean;
  search: string;
  showFilterOptions: boolean;
}

export default function HolidayInfo() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);
  const [data, setData] = useState<HollidayResponses[]>([]);

  const [formState, setFormState] = useState<Formstate>({
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
    showSkill: false,
    search: "",
    showFilterOptions: false,
  });

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
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

  const handleAddFilter = (filter: string) => {
    if (!activeFilters.includes(filter)) {
      setActiveFilters([...activeFilters, filter]);
    }
  };

  const handleToggleFilterOptions = () => {
    setFormState((prev) => ({
      ...prev,
      showFilterOptions: !prev.showFilterOptions,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      const result = await hollidaysService();
      setData(result);
    };

    fetchData();
  }, []);

  const toggleSubOptions = (label: string) => {
    setActiveLabel((prev) => (prev === label ? null : label));
  };

  const filteredData = data.filter((item) =>
    [item.city, item.neigborhood, item.description].some((field) =>
      field.toLowerCase().includes(formState.search.toLowerCase())
    )
  );

  const openModal = () => {
    setFormState((prev) => ({
      ...prev,
      showSkill: !prev.showSkill,
    }));
  };
  return {
    filteredData,
    filterOptions,
    activeLabel,
    formState,
    activeFilters,
    setFormState,
    setActiveLabel,
    handleInputChange,
    openModal,
    toggleSubOptions,
    handleAddFilter,
    handleToggleFilterOptions,
  };
}

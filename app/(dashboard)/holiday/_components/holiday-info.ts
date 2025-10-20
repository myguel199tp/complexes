import React, { useEffect, useState } from "react";
import { hollidaysService, Filters } from "../services/hollidayService";
import { HollidayResponses } from "../services/response/holidayResponses";

interface UIState {
  loading: boolean;
  showSkill: boolean;
  search: string;
  showFilterOptions: boolean;
}

export default function HollidayInfo() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  // 🔹 Incluye más filtros aquí
  const [filters, setFilters] = useState<Filters>({
    property: "",
    minPrice: "",
    maxPrice: "",
    country: "",
    city: "",
    petsAllowed: "",
    parking: "",
    eventsAllowed: "",
    maxGuests: "",
    sort: "highlight",
  });

  const [uiState, setUiState] = useState<UIState>({
    loading: true,
    showSkill: false,
    search: "",
    showFilterOptions: false,
  });

  const [data, setData] = useState<HollidayResponses[]>([]);
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;

    if (id === "maxGuests") {
      setFilters((prev) => ({
        ...prev,
        [id]: value ? Number(value).toString() : "",
      }));
    } else if (id in filters) {
      setFilters((prev) => ({
        ...prev,
        [id]: value,
      }));
    } else {
      setUiState((prev) => ({
        ...prev,
        [id]: value,
      }));
    }
  };

  // const handleInputChange = (
  //   e: React.ChangeEvent<
  //     HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  //   >
  // ) => {
  //   const { id, value } = e.target;
  //   if (id in filters) {
  //     setFilters((prev) => ({
  //       ...prev,
  //       [id]: value,
  //     }));
  //   } else {
  //     setUiState((prev) => ({
  //       ...prev,
  //       [id]: value,
  //     }));
  //   }
  // };

  const openModal = () => {
    setUiState((prev) => ({
      ...prev,
      showSkill: !prev.showSkill,
    }));
  };

  const handleToggleFilterOptions = () => {
    setUiState((prev) => ({
      ...prev,
      showFilterOptions: !prev.showFilterOptions,
    }));
  };

  // 🔹 Efecto que escucha cambios en filtros
  useEffect(() => {
    const fetchData = async () => {
      setUiState((prev) => ({ ...prev, loading: true }));

      try {
        const result = await hollidaysService(filters);
        setData(result);
      } finally {
        setUiState((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchData();
  }, [
    filters.property,
    filters.minPrice,
    filters.maxPrice,
    filters.country,
    filters.city,
    filters.petsAllowed,
    filters.parking,
    filters.eventsAllowed,
    filters.maxGuests,
    filters.sort,
    filters,
  ]);

  const filteredDataHollliday = data.filter((item) =>
    [item.codigo].some((field) =>
      field.toLowerCase().includes(uiState.search.toLowerCase())
    )
  );

  const toggleSubOptions = (label: string) => {
    setActiveLabel((prev) => (prev === label ? null : label));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setFilters((prev) => ({ ...prev, country, city: "" }));
  };

  const handleSwitchChange = (id: keyof Filters) => {
    setFilters((prev) => ({
      ...prev,
      [id]: prev[id] === "true" ? "false" : "true",
    }));
  };

  const handleClear = () => {
    setFilters({
      petsAllowed: "",
      parking: "",
      eventsAllowed: "",
    });
  };

  return {
    handleInputChange,
    toggleSubOptions,
    handleCountryChange,
    handleSwitchChange,
    handleClear,
    handleToggleFilterOptions,
    openModal,
    setFilters,
    setUiState,
    filters,
    uiState,
    activeLabel,
    setActiveLabel,
    filteredDataHollliday,
  };
}

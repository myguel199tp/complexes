import React, { useEffect, useState } from "react";
import { HollidaysService, Filters } from "../services/hollidayService";
import { HollidayResponses } from "../services/response/holidayResponses";

interface UIState {
  loading: boolean;
  showSkill: boolean;
  search: string;
  showFilterOptions: boolean;
}

export default function HollidayInfo() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  // 🔹 Filtros
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
    smokingAllowed: "",
    sort: "highlight",
  });

  // 🔹 UI
  const [uiState, setUiState] = useState<UIState>({
    loading: true,
    showSkill: false,
    search: "",
    showFilterOptions: false,
  });

  // 🔹 Datos y paginación
  const [data, setData] = useState<HollidayResponses[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // 🔹 Manejo de inputs
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

  // 🔹 Obtener datos con filtros + paginación
  useEffect(() => {
    const fetchData = async () => {
      setUiState((prev) => ({ ...prev, loading: true }));

      try {
        const result = await HollidaysService({
          filters,
          page,
          limit: 24,
        });

        // Si la respuesta tiene menos de 24 elementos → no hay más
        if (result.length < 24) {
          setHasMore(false);
        }

        // Si page = 1 reinicia, si no acumula
        setData((prev) => (page === 1 ? result : [...prev, ...result]));
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
    page,
  ]);

  // 🔹 Reinicia la paginación cuando cambian los filtros
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setData([]);
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
  ]);

  // 🔹 Filtro local de búsqueda
  const filteredDataHollliday = data.filter((item) =>
    [item.codigo].some((field) =>
      field.toLowerCase().includes(uiState.search.toLowerCase())
    )
  );

  // 🔹 Varios handlers
  const toggleSubOptions = (label: string) => {
    setActiveLabel((prev) => (prev === label ? null : label));
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    setFilters((prev) => ({ ...prev, country, city: "" }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityValue = e.target.value;
    setFilters((prev) => ({
      ...prev,
      city: cityValue,
    }));
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
      smokingAllowed: "",
    });
  };

  // 🔹 Retornar todo lo necesario
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
    handleCityChange,
    filters,
    uiState,
    activeLabel,
    setActiveLabel,
    filteredDataHollliday,
    data,
    page,
    setPage,
    hasMore,
  };
}

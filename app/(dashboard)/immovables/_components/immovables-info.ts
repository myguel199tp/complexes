import React, { useEffect, useState } from "react";
import { Filters, ImmovableService } from "../services/inmovableService";
import { InmovableResponses } from "../services/response/inmovableResponses";

interface UIState {
  loading: boolean;
  showSkill: boolean;
  search: string;
  showFilterOptions: boolean;
}

export default function ImmovablesInfo() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    country: "",
    city: "",
    ofert: "",
    stratum: "",
    room: "",
    restroom: "",
    age: "",
    parking: "",
    property: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    sort: "highlight",
  });

  const [uiState, setUiState] = useState<UIState>({
    loading: true,
    showSkill: false,
    search: "",
    showFilterOptions: false,
  });

  const [data, setData] = useState<InmovableResponses[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

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

  useEffect(() => {
    const fetchData = async () => {
      setUiState((prev) => ({ ...prev, loading: true }));

      try {
        const result = await ImmovableService({
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
    filters.country,
    filters.city,
    filters.ofert,
    filters.stratum,
    filters.room,
    filters.age,
    filters.restroom,
    filters.parking,
    filters.minPrice,
    filters.property,
    filters.maxPrice,
    filters.minArea,
    filters.maxArea,
    filters.sort,
    page,
    filters,
  ]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    setData([]);
  }, [
    filters.property,
    filters.country,
    filters.city,
    filters.ofert,
    filters.stratum,
    filters.room,
    filters.age,
    filters.restroom,
    filters.parking,
    filters.minPrice,
    filters.property,
    filters.maxPrice,
    filters.minArea,
    filters.maxArea,
    filters.sort,
  ]);

  const filteredDataHollliday = data.filter((item) =>
    [item.codigo].some((field) =>
      field.toLowerCase().includes(uiState.search.toLowerCase())
    )
  );

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

  const handleClear = () => {
    setFilters((prev) => ({
      ...prev, // mantiene country y city
      ofert: "",
      stratum: "",
      room: "",
      restroom: "",
      age: "",
      parking: "",
      property: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      sort: "highlight",
    }));
  };

  const clearNonLocationFilters = () => {
    setFilters((prev) => ({
      ...prev,
      ofert: "",
      stratum: "",
      room: "",
      restroom: "",
      age: "",
      parking: "",
      property: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      sort: "highlight",
    }));
  };

  const filteredData = data.filter((item) =>
    [item.city, item.neighborhood, item.description].some((field) =>
      field.toLowerCase().includes(uiState.search.toLowerCase())
    )
  );

  return {
    handleInputChange,
    handleCountryChange,
    handleClear,
    handleToggleFilterOptions,
    openModal,
    setFilters,
    setUiState,
    filteredData,
    clearNonLocationFilters,
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

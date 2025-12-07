import React, { useEffect, useState } from "react";
import { Filters, ImmovableService } from "../services/inmovableService";
import { InmovableResponses } from "../services/response/inmovableResponses";
import { useTranslation } from "react-i18next";

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
    currency: "",
    room: "",
    restroom: "",
    age: "",
    parking: "",
    property: "",
    minPrice: "",
    maxPrice: "",
    minArea: "",
    maxArea: "",
    sort: "",
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

  const { t } = useTranslation();

  useEffect(() => {
    console.log("🧭 Filtros actualizados:", filters);
  }, [filters]);

  useEffect(() => {
    console.log("🔍 Búsqueda:", uiState.search);
  }, [uiState.search]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { id, value } = e.target;

    console.log(`📝 handleInputChange -> id: ${id}, value: ${value}`);

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
    console.log("🪟 Estado de filtros visibles:", !uiState.showSkill);
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
      console.log("📡 Fetching inmuebles con filtros:", filters);

      try {
        const result = await ImmovableService({
          filters,
          page,
          limit: 24,
        });

        console.log("✅ Resultado de ImmovableService:", result);

        if (result.length < 24) {
          setHasMore(false);
        }

        setData((prev) => (page === 1 ? result : [...prev, ...result]));
      } catch (err) {
        console.error("❌ Error obteniendo inmuebles:", err);
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
    filters.room,
    filters.age,
    filters.restroom,
    filters.parking,
    filters.minPrice,
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
    console.log("🔄 Reinicio de paginación por cambio de filtros");
  }, [
    filters.property,
    filters.country,
    filters.city,
    filters.ofert,
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

  /** 👉 Log cada vez que cambia la data filtrada */
  useEffect(() => {
    console.log(
      "📊 Datos filtrados (filteredDataHollliday):",
      filteredDataHollliday
    );
  }, [filteredDataHollliday]);

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
    console.log("🧹 Limpiando filtros...");
    setFilters((prev) => ({
      ...prev,
      ofert: "",
      currency: "",
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
      currency: "",
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
    t,
  };
}

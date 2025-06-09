import React, { useEffect, useState } from "react";
import { hollidaysService } from "../services/hollidayService";
import { HollidayResponses } from "../services/response/holidayResponses";

interface FilterState {
  property?: string;
  minPrice?: string;
  maxPrice?: string;
}

interface UIState {
  loading: boolean;
  showSkill: boolean;
  search: string;
  showFilterOptions: boolean;
}

export default function HollidayInfo() {
  const [activeLabel, setActiveLabel] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    property: "",
    minPrice: "",
    maxPrice: "",
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
    if (id in filters) {
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
      setUiState((prev) => ({
        ...prev,
        loading: true,
      }));
      try {
        const result = await hollidaysService({
          property: filters.property,
          minPrice: filters.minPrice,
          maxPrice: filters.maxPrice,
        });
        setData(result);
      } finally {
        setUiState((prev) => ({
          ...prev,
          loading: false,
        }));
      }
    };

    fetchData();
  }, [filters.property, filters.minPrice, filters.maxPrice]);

  const filteredData = data.filter((item) =>
    [item.city, item.neigborhood, item.country].some((field) =>
      field.toLowerCase().includes(uiState.search.toLowerCase())
    )
  );

  return {
    handleInputChange,
    handleToggleFilterOptions,
    openModal,
    setFilters,
    setUiState,
    filters,
    uiState,
    activeLabel,
    setActiveLabel,
    filteredData,
  };
}

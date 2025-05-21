import React, { useEffect, useState } from "react";
import { InmovableResponses } from "../services/response/inmovableResponses";
import RegisterOptions from "@/app/(panel)/my-new-immovable/_components/property/_components/regsiter-options";
import { immovableService } from "../services/inmovableService";

interface FilterState {
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
  selectedId: string;
}

interface UIState {
  loading: boolean;
  showSkill: boolean;
  search: string;
  showFilterOptions: boolean;
}

export default function ImmovablesInfo() {
  const [filters, setFilters] = useState<FilterState>({
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
    selectedId: "",
  });

  const [uiState, setUiState] = useState<UIState>({
    loading: true,
    showSkill: false,
    search: "",
    showFilterOptions: false,
  });

  const [data, setData] = useState<InmovableResponses[]>([]);

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

  const {
    ofertOptions,
    parkingOptions,
    restroomOptions,
    roomOptions,
    stratumOptions,
  } = RegisterOptions();

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
        const result = await immovableService({
          ofert: filters.ofert,
          stratum: filters.stratum,
          room: filters.room,
          restroom: filters.restroom,
          age: filters.age,
          parking: filters.parking,
          property: filters.selectedId,
          minPrice: filters.copInit,
          maxPrice: filters.copEnd,
          minArea: filters.areaInit,
          maxArea: filters.areaEnd,
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
  }, [
    filters.ofert,
    filters.stratum,
    filters.room,
    filters.restroom,
    filters.age,
    filters.parking,
    filters.selectedId,
    filters.copInit,
    filters.copEnd,
    filters.areaInit,
    filters.areaEnd,
  ]);

  const filteredData = data.filter((item) =>
    [item.city, item.neighborhood, item.description].some((field) =>
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
    ofertOptions,
    parkingOptions,
    restroomOptions,
    roomOptions,
    stratumOptions,
    filteredData,
  };
}

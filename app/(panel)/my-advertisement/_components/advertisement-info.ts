import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdvertisementResponses } from "../services/response/advertisementResponse";
import { advertisementsService } from "../services/advertisementService";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

interface FormState {
  names: string;
  contact: string;
  typeService: string;
  search: string;

  profession: string;
  category: string;
  typeOfert: string;

  onlyAvailable: boolean;
  onlyProducts: boolean;
  onlyWithSocials: boolean;

  minPrice: number | "";
  maxPrice: number | "";

  workDay: string;

  sort: string;
}
interface ValueState {
  showSkill: boolean;
}

export default function AdvertisementInfo() {
  const [formState, setFormState] = useState<FormState>({
    names: "",
    contact: "",
    typeService: "",
    search: "",

    profession: "",
    category: "",
    typeOfert: "",

    onlyAvailable: false,
    onlyProducts: false,
    onlyWithSocials: false,

    minPrice: "",
    maxPrice: "",

    workDay: "",

    sort: "",
  });

  const [formToogle, setFormToogle] = useState<ValueState>({
    showSkill: false,
  });

  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { id, value } = e.target;
    setFormState((prevState) => ({
      ...prevState,
      [id]: value,
    }));
  };

  const openModal = () => {
    setFormToogle((prev) => ({
      ...prev,
      showSkill: !prev.showSkill,
    }));
  };

  const {
    data = [],
    isLoading,
    error,
  } = useQuery<AdvertisementResponses[]>({
    queryKey: [
      "advertisements",
      infoConjunto,
      formState.names,
      formState.contact,
      formState.typeService,
    ],
    queryFn: () =>
      advertisementsService(infoConjunto, {
        names: formState.names,
        contact: formState.contact,
        typeService: formState.typeService,
      }),
    enabled: !!infoConjunto,
  });

  const filteredData = Array.isArray(data)
    ? data
        .filter((item) => {
          const search = formState.search.toLowerCase();

          // Búsqueda general
          const matchSearch = [
            item.name,
            item.description,
            item.profession,
            ...item.products.map((p) => p.name),
            ...item.products.map((p) => p.category),
          ]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(search));

          // Profesión
          const matchProfession = formState.profession
            ? item.profession
                ?.toLowerCase()
                .includes(formState.profession.toLowerCase())
            : true;

          // Categoría
          const matchCategory = formState.category
            ? item.products.some((p) =>
                p.category
                  ?.toLowerCase()
                  .includes(formState.category.toLowerCase()),
              )
            : true;

          // Tipo oferta
          const matchType = formState.typeOfert
            ? item.typeOfert === formState.typeOfert
            : true;

          // Solo disponibles fuera
          const matchAvailable = formState.onlyAvailable
            ? item.statusOut
            : true;

          // Solo con productos
          const matchProducts = formState.onlyProducts
            ? item.products.length > 0
            : true;

          // Solo con redes sociales
          const matchSocials = formState.onlyWithSocials
            ? item.instagramred ||
              item.facebookred ||
              item.tiktokred ||
              item.youtubered ||
              item.xred
            : true;

          // Día laboral
          const matchWorkDay = formState.workDay
            ? item.workDays.includes(formState.workDay)
            : true;

          // Precio mínimo
          const matchMinPrice =
            formState.minPrice !== ""
              ? item.products.some((p) => p.price >= Number(formState.minPrice))
              : true;

          // Precio máximo
          const matchMaxPrice =
            formState.maxPrice !== ""
              ? item.products.some((p) => p.price <= Number(formState.maxPrice))
              : true;

          return (
            matchSearch &&
            matchProfession &&
            matchCategory &&
            matchType &&
            matchAvailable &&
            matchProducts &&
            matchSocials &&
            matchWorkDay &&
            matchMinPrice &&
            matchMaxPrice
          );
        })
        .sort((a, b) => {
          // A-Z
          if (formState.sort === "az") {
            return a.name.localeCompare(b.name);
          }

          // Z-A
          if (formState.sort === "za") {
            return b.name.localeCompare(a.name);
          }

          // Precio menor
          if (formState.sort === "priceLow") {
            return (
              Math.min(...a.products.map((p) => p.price)) -
              Math.min(...b.products.map((p) => p.price))
            );
          }

          // Precio mayor
          if (formState.sort === "priceHigh") {
            return (
              Math.max(...b.products.map((p) => p.price)) -
              Math.max(...a.products.map((p) => p.price))
            );
          }

          return 0;
        })
    : [];

  return {
    setFormState,
    handleInputChange,
    openModal,
    formState,
    formToogle,
    filteredData,
    isLoading,
    error,
  };
}

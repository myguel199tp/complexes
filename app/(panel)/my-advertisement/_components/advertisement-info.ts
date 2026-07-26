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

/**
 * Precios de todo lo que ofrece un negocio, productos y servicios.
 * Los negocios sin catálogo quedan al final del orden por precio en vez de
 * producir `Infinity`, que era lo que devolvía `Math.min()` sobre un array
 * vacío y desordenaba la grilla entera.
 */
function pricesOf(item: AdvertisementResponses): number[] {
  return [
    ...item.products.map((p) => Number(p.price)),
    ...(item.services ?? []).map((s) => Number(s.price)),
  ].filter((price) => Number.isFinite(price));
}

function cheapest(item: AdvertisementResponses): number {
  const prices = pricesOf(item);
  return prices.length > 0 ? Math.min(...prices) : Number.MAX_SAFE_INTEGER;
}

function priciest(item: AdvertisementResponses): number {
  const prices = pricesOf(item);
  return prices.length > 0 ? Math.max(...prices) : -1;
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
    // El tipo de oferta y la categoría se resuelven en SQL: el backend ya no
    // devuelve todo el conjunto para que el cliente descarte en memoria.
    queryKey: [
      "advertisements",
      infoConjunto,
      formState.names,
      formState.contact,
      formState.typeService,
      formState.typeOfert,
      formState.category,
    ],
    queryFn: () =>
      advertisementsService(infoConjunto, {
        names: formState.names,
        contact: formState.contact,
        typeService: formState.typeService,
        typeOfert: formState.typeOfert,
        category: formState.category,
      }),
    enabled: !!infoConjunto,
  });

  const filteredData = Array.isArray(data)
    ? data
        .filter((item) => {
          const search = formState.search.toLowerCase();

          // Búsqueda general
          // La búsqueda también mira los servicios: si alguien escribe
          // "manicure" tiene que encontrar a quien lo ofrece, no solo a quien
          // vende algo con esa palabra en el nombre del producto.
          const matchSearch = [
            item.name,
            item.description,
            item.profession,
            ...item.products.map((p) => p.name),
            ...item.products.map((p) => p.category),
            ...(item.services ?? []).map((s) => s.name),
            ...(item.services ?? []).map((s) => s.category),
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

          // Solo negocios con algo publicado (productos o servicios)
          const matchProducts = formState.onlyProducts
            ? item.products.length > 0 || (item.services?.length ?? 0) > 0
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

          // El rango de precio aplica a todo lo que se ofrece, no solo a los
          // productos: un servicio también tiene precio.
          const allPrices = [
            ...item.products.map((p) => Number(p.price)),
            ...(item.services ?? []).map((s) => Number(s.price)),
          ];

          const matchMinPrice =
            formState.minPrice !== ""
              ? allPrices.some((price) => price >= Number(formState.minPrice))
              : true;

          const matchMaxPrice =
            formState.maxPrice !== ""
              ? allPrices.some((price) => price <= Number(formState.maxPrice))
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
            return cheapest(a) - cheapest(b);
          }

          // Precio mayor
          if (formState.sort === "priceHigh") {
            return priciest(b) - priciest(a);
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

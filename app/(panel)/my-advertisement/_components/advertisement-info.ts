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
    ? data?.filter((item) =>
        [item?.description, item?.profession, item?.name].some((field) =>
          field?.toLowerCase().includes(formState.search.toLowerCase()),
        ),
      )
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

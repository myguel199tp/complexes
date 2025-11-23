import React, { useEffect, useState } from "react";
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
  loading: boolean;
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
    loading: true,
    showSkill: false,
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

  const [data, setData] = useState<AdvertisementResponses[]>([]);

  const openModal = () => {
    setFormToogle((prev) => ({
      ...prev,
      showSkill: !prev.showSkill,
    }));
  };

  const { conjuntoId } = useConjuntoStore();
  const infoConjunto = conjuntoId ?? "";

  useEffect(() => {
    const fetchData = async () => {
      setFormToogle((prev) => ({ ...prev, loading: true }));
      try {
        const filters = {
          names: formState.names,
          contact: formState.contact,
          typeService: formState.typeService,
        };
        const result = await advertisementsService(infoConjunto, filters);
        setData(result);
      } finally {
        setFormToogle((prev) => ({ ...prev, loading: false }));
      }
    };
    fetchData();
  }, [formState, infoConjunto]);

  const filteredData = data?.filter((item) =>
    [item?.description, item.profession, item.name].some((field) =>
      field?.toLowerCase().includes(formState.search.toLowerCase())
    )
  );

  return {
    setFormState,
    setFormToogle,
    handleInputChange,
    openModal,
    formState,
    formToogle,
    filteredData,
  };
}

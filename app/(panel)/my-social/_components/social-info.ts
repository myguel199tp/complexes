import { useEffect, useState } from "react";
import { ActivityResponse } from "../../my-activity/services/response/activityResponse";
import { allActivityService } from "../../my-activity/services/activityAllServices";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";
import { useSocialModalStore } from "./useSocialStore";

export default function SocialInfo() {
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityResponse | null>(null);
  const [data, setData] = useState<ActivityResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);
  const {
    isOpen: showSocial,
    open: openModalStore,
    close: closeModal,
  } = useSocialModalStore();

  const openModal = (activity: ActivityResponse) => {
    setSelectedActivity(activity);
    openModalStore(); 
  };

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      if (!conjuntoId) return;

      try {
        const result = await allActivityService(conjuntoId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, [conjuntoId]);

  return {
    selectedActivity,
    showSocial,
    closeModal,
    openModal,
    BASE_URL,
    data,
    error,
  };
}

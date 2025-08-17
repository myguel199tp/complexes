import { useEffect, useState } from "react";
import { ActivityResponse } from "../../my-activity/services/response/activityResponse";
import { allActivityService } from "../../my-activity/services/activityAllServices";
import { useConjuntoStore } from "@/app/(sets)/ensemble/components/use-store";

export default function SocialInfo() {
  const [showSocial, setShowSocial] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityResponse | null>(null);
  const [data, setData] = useState<ActivityResponse[]>([]);
  const [error, setError] = useState<string | null>(null);
  const conjuntoId = useConjuntoStore((state) => state.conjuntoId);

  const openModal = (activity: ActivityResponse) => {
    setSelectedActivity(activity);
    setShowSocial(true);
  };

  const closeModal = () => {
    setShowSocial(false);
  };

  const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      if (!conjuntoId) return; // 👈 Evita ejecutar si es null

      try {
        const result = await allActivityService(conjuntoId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, []);

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

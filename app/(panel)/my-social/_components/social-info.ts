import { useEffect, useState } from "react";
import { ActivityResponse } from "../../my-activity/services/response/activityResponse";
import { allActivityService } from "../../my-activity/services/activityAllServices";

export default function SocialInfo() {
  const [showSocial, setShowSocial] = useState<boolean>(false);
  const [selectedActivity, setSelectedActivity] =
    useState<ActivityResponse | null>(null);
  const [data, setData] = useState<ActivityResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

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
      try {
        const result = await allActivityService();
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

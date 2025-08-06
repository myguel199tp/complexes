import { EnsembleResponse } from "../service/response/ensembleResponse";
import { EnsembleService } from "../service/ensembleService";
import { useEffect, useState } from "react";

export default function EnsembleInfo() {
  const [data, setData] = useState<EnsembleResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await EnsembleService();
        setData(result);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    loading,
    data,
  };
}

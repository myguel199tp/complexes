import { useEffect, useState } from "react";
import { AddResponses } from "../services/response/addResponse";
import { addInfoService } from "../services/addInfoServices";

export function useTableInfo() {
  const [data, setData] = useState<AddResponses[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await addInfoService();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      }
    };

    fetchData();
  }, []);

  return { data, error, filterText, setFilterText };
}

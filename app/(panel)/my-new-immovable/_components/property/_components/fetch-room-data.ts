"use client";
import { useEffect, useState } from "react";
import { roomService } from "../services/roomService";
import { roomResponses } from "../services/response/roomResponse";

export function useRoomData() {
  const [data, setData] = useState<roomResponses[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await roomService();
        setData(response);
      } catch (err) {
        setError(`Error al encontrar la información: ${err}`);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, loading, error };
}

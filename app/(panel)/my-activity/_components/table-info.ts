"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useActivityQuery } from "./use-activity-query";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function useActivityTable() {
  const queryClient = useQueryClient();
  const { data = [], error } = useActivityQuery();
  const { t } = useTranslation();
  const { language } = useLanguage();

  const [filterText, setFilterText] = useState("");
  const QUERY_ACTIVTY = "query_activity";
  const updateStatusLocally = (id: number, newStatus: boolean) => {
    queryClient.setQueryData([QUERY_ACTIVTY], (oldData: any) => {
      if (!oldData) return oldData;
      return oldData.map((item: any) =>
        item.id === id ? { ...item, status: newStatus } : item
      );
    });
  };

  return {
    data,
    error,
    language,
    filterText,
    setFilterText,
    updateStatusLocally,
    t,
  };
}

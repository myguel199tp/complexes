"use client";

import { useQuery } from "@tanstack/react-query";
import { packageService } from "../services/newsPackageService";

export const QUERY_NER_PACKAGE = "query_new_package";
export function usePackageQuery() {
  const modules = "news";
  const query = useQuery({
    queryKey: [QUERY_NER_PACKAGE, modules],
    queryFn: () => packageService(modules),
  });

  return {
    ...query,
  };
}

// src/hooks/useInfoQuery.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { packageService } from "../../my-news/services/newsPackageService";

export function usePackageQuery() {
  const modules = "documents";
  const QUERY_DOCS_PACKAGE = "query_docs_package";
  const query = useQuery({
    queryKey: [QUERY_DOCS_PACKAGE, modules],
    queryFn: () => packageService(modules),
  });

  return {
    ...query,
  };
}

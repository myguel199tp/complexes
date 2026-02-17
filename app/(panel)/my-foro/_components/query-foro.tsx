// src/hooks/useInfoQuery.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { packageService } from "../../my-news/services/newsPackageService";

export function usePackageQuery() {
  const modules = "forum";
  const QUERY_FORUM_PACKAGE = "query_forum_package";
  const query = useQuery({
    queryKey: [QUERY_FORUM_PACKAGE, modules],
    queryFn: () => packageService(modules),
  });

  return {
    ...query,
  };
}

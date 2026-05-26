"use client";

import { packageService } from "@/app/(panel)/my-news/services/newsPackageService";
import { useQuery } from "@tanstack/react-query";

export function usePackageQuery() {
  const modules = "seller";
  const QUERY_SELLER_PACKAGE = "query_seller_package";
  const query = useQuery({
    queryKey: [QUERY_SELLER_PACKAGE, modules],
    queryFn: () => packageService(modules),
  });

  return {
    ...query,
  };
}

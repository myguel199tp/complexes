"use client";

import React from "react";
import { useSellerAccessQuery } from "./packages/subscriptionquery";

import AllAdds from "./allAds";
import SellerPackages from "./packages/SellerPackages";

export default function Myadds() {
  const { data, isLoading } = useSellerAccessQuery();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!data?.active) {
    return <SellerPackages />;
  }

  return <AllAdds />;
}

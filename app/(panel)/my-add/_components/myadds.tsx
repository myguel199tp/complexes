"use client";

import React from "react";
import Link from "next/link";
import { Button } from "complexes-next-components";
import { route } from "@/app/_domain/constants/routes";
import { useSellerAccessQuery } from "./packages/subscriptionquery";

import AllAdds from "./allAds";
import SellerPackages from "./packages/SellerPackages";

export default function Myadds() {
  const { data, isLoading } = useSellerAccessQuery();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="w-full">
      {/* Los pedidos del vendedor viven aquí, junto a sus anuncios, y ya no en
          el menú de la barra lateral. Se muestran tenga o no suscripción
          activa: quien ya compró o vendió necesita seguir viendo sus pedidos. */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href={route.myOrders}>
          <Button size="sm" rounded="md">
            Mis pedidos
          </Button>
        </Link>
        <Link href={route.mySales}>
          <Button size="sm" rounded="md">
            Pedidos recibidos
          </Button>
        </Link>
      </div>

      {data?.active ? <AllAdds /> : <SellerPackages />}
    </div>
  );
}

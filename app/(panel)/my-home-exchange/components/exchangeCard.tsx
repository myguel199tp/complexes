"use client";

import { Text, Button } from "complexes-next-components";
import { ExchangeResponse } from "../services/request/homeExchangeRequest";

export function ExchangeCard({ item }: { item?: ExchangeResponse }) {
  return (
    <div className="border p-4 rounded space-y-2">
      <Text colVariant="on">Ciudad: {item?.city}</Text>
      <Text colVariant="on">
        Disponible: {item?.availableFrom} → {item?.availableTo}
      </Text>
      <Text colVariant="on">Estado: {item?.status}</Text>
      {item?.status === "pending" && (
        <div className="flex gap-2">
          <Button
            className="bg-green-500 text-white px-3 py-1"
          >
            Aceptar
          </Button>
          <Button
            className="bg-red-500 text-white px-3 py-1"
          >
            Rechazar
          </Button>
        </div>
      )}
    </div>
  );
}

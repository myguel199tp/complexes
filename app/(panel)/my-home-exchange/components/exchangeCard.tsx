"use client";

import { Text, Button } from "complexes-next-components";
// import { useRespondExchange } from "../hooks/useRespondExchange";
import { ExchangeResponse } from "../services/request/homeExchangeRequest";

export function ExchangeCard({ item }: { item?: ExchangeResponse }) {
  // const { mutate } = useRespondExchange();

  // function respond(status: "accepted" | "rejected") {
  //   mutate({
  //     id: item.id,
  //     input: { status },
  //   });
  // }

  return (
    <div className="border p-4 rounded space-y-2">
      <Text>Ciudad: {item?.city}</Text>
      <Text>
        Disponible: {item?.availableFrom} → {item?.availableTo}
      </Text>
      <Text>Estado: {item?.status}</Text>
      {item?.status === "pending" && (
        <div className="flex gap-2">
          <Button
            // onClick={() => respond("accepted")}
            className="bg-green-500 text-white px-3 py-1"
          >
            Aceptar
          </Button>
          <Button
            // onClick={() => respond("rejected")}
            className="bg-red-500 text-white px-3 py-1"
          >
            Rechazar
          </Button>
        </div>
      )}
    </div>
  );
}

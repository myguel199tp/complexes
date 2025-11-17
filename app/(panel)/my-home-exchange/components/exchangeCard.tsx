"use client";

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
      <p>
        <b>Ciudad:</b> {item?.city}
      </p>
      <p>
        <b>Disponible:</b> {item?.availableFrom} → {item?.availableTo}
      </p>
      <p>
        <b>Estado:</b> {item?.status}
      </p>

      {item?.status === "pending" && (
        <div className="flex gap-2">
          <button
            // onClick={() => respond("accepted")}
            className="bg-green-500 text-white px-3 py-1"
          >
            Aceptar
          </button>
          <button
            // onClick={() => respond("rejected")}
            className="bg-red-500 text-white px-3 py-1"
          >
            Rechazar
          </button>
        </div>
      )}
    </div>
  );
}

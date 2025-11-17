"use client";

import { ExchangeCard } from "./exchangeCard";

export default function ExchangeList() {
  // const { data } = useGetExchanges();

  // if (!data) return <p>Cargando...</p>;

  return (
    <div className="grid gap-4 mt-4">
      {/* {data.map((item) => (
        <ExchangeCard key={item.id} item={item} />
      ))} */}
      <ExchangeCard />
    </div>
  );
}

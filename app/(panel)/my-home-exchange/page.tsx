"use client";
import ExchangeList from "./components/exchangeList";
import HomeExchangeForm from "./components/homeExchangeForm";
import { Title } from "complexes-next-components";

export default function Page() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Title colVariant="on" as="h1" size="xs" font="bold">Intercambio de Hogares</Title>

      <HomeExchangeForm />
      <ExchangeList />
    </div>
  );
}

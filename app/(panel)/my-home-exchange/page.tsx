import ExchangeList from "./components/exchangeList";
import HomeExchangeForm from "./components/homeExchangeForm";

export default function Page() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Intercambio de Hogares</h1>

      <HomeExchangeForm />
      <ExchangeList />
    </div>
  );
}

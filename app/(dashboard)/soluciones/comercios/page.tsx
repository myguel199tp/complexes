import { Metadata } from "next";
import ComerciosLanding from "./_components/comercios-landing";

export const metadata: Metadata = {
  title: "Para comercios | globaliaph",
  description:
    "Vende a los conjuntos residenciales que usan globaliaph: planes de servicio para la administración (B2B) y catálogo con entrega a la puerta para los residentes (B2C). Registro gratis.",
};

export default function ComerciosPage() {
  return <ComerciosLanding />;
}

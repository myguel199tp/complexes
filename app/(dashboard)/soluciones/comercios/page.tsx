import { pageMetadata } from "@/app/_domain/constants/seo";
import ComerciosLanding from "./_components/comercios-landing";

export const metadata = pageMetadata({
  title: "Vende a los conjuntos residenciales",
  description:
    "Vende a los conjuntos residenciales que usan globaliaph: planes de servicio para la administración (B2B) y catálogo con entrega a la puerta para los residentes (B2C). Registro gratis y sin comisión por venta.",
  socialDescription:
    "Planes de servicio para la administración (B2B) y catálogo con entrega a la puerta para los residentes (B2C). Registro gratis.",
  path: "/soluciones/comercios",
});

export default function ComerciosPage() {
  return <ComerciosLanding />;
}

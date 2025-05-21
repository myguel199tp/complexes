/* eslint-disable react-hooks/rules-of-hooks */
import { useState } from "react";

export default function paymentsInfo() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [apartmentCount, setApartmentCount] = useState<string>("");

  const sections = [
    {
      id: "bronze",
      borderColor: "border-red-200",
      hoverColor: "bg-red-200",
      title: "Conjunto Pequeño",
      duration: "calcule el costo a pagar",
      quantity: "De 10 a 60 inmuebles",
      min: 10,
      max: 60,
      price: 18000,
      features: [
        "Citofonía Virtual",
        "Avisos y Comunicados",
        "Gestión para Actividades",
        "Registro de visitantes",
        "Registro de residentes",
        "Página de noticias",
        "Marketplace de Productos y Servicios",
        "Venta y arriendo hasta 6 inmuebles",
        "Renta vacacional",
      ],
    },
    {
      id: "gold",
      borderColor: "border-yellow-200",
      hoverColor: "bg-yellow-200",
      title: "Conjunto Mediano",
      duration: "calcule el costo a pagar",
      quantity: "De 61 a 180 inmuebles",
      min: 61,
      max: 180,
      price: 16000,
      features: [
        "Citofonía Virtual",
        "Avisos y Comunicados",
        "Gestión para Actividades",
        "Registro de visitantes",
        "Registro de residentes",
        "Página de noticias",
        "Marketplace de Productos y Servicios",
        "Venta y arriendo hasta 6 inmuebles",
        "Renta vacacional",
      ],
    },
    {
      id: "diamond",
      borderColor: "border-gray-200",
      hoverColor: "bg-gray-200",
      title: "Conjunto Grande",
      duration: "calcule el costo a pagar",
      quantity: "De 181 a 300 inmuebles",
      min: 181,
      max: 300,
      price: 14000,
      features: [
        "Citofonía Virtual",
        "Avisos y Comunicados",
        "Gestión para Actividades",
        "Registro de visitantes",
        "Registro de residentes",
        "Página de noticias",
        "Marketplace de Productos y Servicios",
        "Venta y arriendo hasta 6 inmuebles",
        "Renta vacacional",
      ],
    },
    {
      id: "colossal",
      borderColor: "border-cyan-200",
      hoverColor: "bg-cyan-200",
      title: "Conjunto Colosal",
      duration: "calcule el costo a pagar",
      quantity: "Más de 301 inmuebles",
      min: 301,
      max: 500,
      price: 12000,
      features: [
        "Citofonía Virtual",
        "Avisos y Comunicados",
        "Gestión para Actividades",
        "Registro de visitantes",
        "Registro de residentes",
        "Página de noticias",
        "Marketplace de Productos y Servicios",
        "Venta y arriendo hasta 6 inmuebles",
        "Renta vacacional",
      ],
    },
  ];
  const selectedPlan = sections.find(
    (section) => section.id === selectedSection
  );
  const numericValue = Number(apartmentCount);
  const isValid =
    numericValue >= (selectedPlan?.min || 0) &&
    numericValue <= (selectedPlan?.max || 0);

  const calculateTotal = (
    num: number,
    selectedPlan: (typeof sections)[0] | undefined
  ) => {
    if (!selectedPlan) return null;

    let total = 0;
    let remaining = num;

    for (const section of sections) {
      if (remaining <= 0) break;
      const inThisRange = Math.min(remaining, section.max - section.min + 1);
      total += inThisRange * section.price;
      remaining -= inThisRange;
    }

    return total;
  };

  const total = isValid ? calculateTotal(numericValue, selectedPlan) : null;

  const iva = 0.19;
  const valorConIva = (total ?? 0) * (1 + iva);

  return {
    valorConIva,
    selectedSection,
    apartmentCount,
    sections,
    numericValue,
    isValid,
    selectedPlan,
    total,
    setSelectedSection,
    setApartmentCount,
  };
}

/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from "react";
import { useRegisterStore } from "../store/registerStore";
type BillingPeriod = "mensual" | "anual";

export default function paymentsInfo() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [apartmentCount, setApartmentCount] = useState<string>("");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("mensual");
  const { setQuantity, setPrices } = useRegisterStore();

  const sections = [
    {
      id: "bronze",
      borderColor: "border-red-200",
      hoverColor: "bg-red-200",
      title: "Conjunto Pequeño",
      duration: "calcule el costo a pagar",
      quantity: "De 50 a 150 inmuebles",
      min: 50,
      max: 150,
      price: 1599,
      annualPrice: 1599 * 12,
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
      quantity: "De 151 a 320 inmuebles",
      min: 151,
      max: 320,
      price: 799,
      annualPrice: 799 * 12,
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
      quantity: "De 321 a 520 inmuebles",
      min: 321,
      max: 520,
      price: 599,
      annualPrice: 599 * 12,
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
      quantity: "Más de 520 inmuebles",
      min: 521,
      max: 5000,
      price: 399,
      annualPrice: 399 * 12,
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
    numericValue <= (selectedPlan?.max || Infinity);

  // Calcula costo base (mensual o anual sin IVA)
  const calculateBase = () => {
    if (!selectedPlan || !isValid) return 0;
    return billingPeriod === "mensual"
      ? calculateTotalMonthly(numericValue) || 0
      : selectedPlan.annualPrice * 1; // annualPrice ya incluye el factor 12
  };

  // Calcula total mensual sin IVA (para rangos escalonados)
  const calculateTotalMonthly = (num: number): number | null => {
    let total = 0;
    let remaining = num;

    for (const section of sections) {
      if (remaining <= 0) break;
      const inRange = Math.min(remaining, section.max - section.min + 1);
      total += inRange * section.price;
      remaining -= inRange;
    }

    return total;
  };

  const iva = 0.19;
  const baseAmount = calculateBase();
  const totalConIva = Math.round(baseAmount * (1 + iva));
  const porapatamento = Math.round(totalConIva / numericValue);

  useEffect(() => {
    if (isValid) {
      setQuantity(numericValue);
      setPrices(totalConIva);
    }
  }, [isValid, numericValue, totalConIva, setQuantity, setPrices]);
  return {
    selectedSection,
    apartmentCount,
    totalConIva,
    sections,
    numericValue,
    isValid,
    selectedPlan,
    porapatamento,
    setBillingPeriod,
    setSelectedSection,
    setApartmentCount,
  };
}

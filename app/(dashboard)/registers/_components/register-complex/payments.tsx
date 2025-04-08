import React, { useState } from "react";
import { Button, InputField, Text } from "complexes-next-components";

export default function Payments() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [apartmentCount, setApartmentCount] = useState<string>("");

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(value);

  const sections = [
    {
      id: "bronze",
      borderColor: "border-red-200",
      hoverColor: "bg-red-200",
      title: "Conjunto Pequeño",
      duration: "calcule el costo a pagar",
      quantity: "De 10 a 60 apartamentos",
      min: 10,
      max: 60,
      price: 50000,
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
      quantity: "De 61 a 180 apartamentos",
      min: 61,
      max: 180,
      price: 45000,
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
      quantity: "De 181 a 300 apartamentos",
      min: 181,
      max: 300,
      price: 40000,
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
      quantity: "Más de 301 apartamentos",
      min: 301,
      max: 500,
      price: 35000,
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

  return (
    <div className="flex gap-5 w-full justify-center mt-4">
      {sections.map((section) => (
        <section
          key={section.id}
          onClick={() => {
            setSelectedSection(section.id);
            setApartmentCount("");
          }}
          className={`border-2 ${
            section.borderColor
          } rounded-lg p-6 cursor-pointer ${
            selectedSection === section.id
              ? section.hoverColor
              : `hover:${section.hoverColor}`
          }`}
        >
          <div>
            <Text font="bold">SERVICIOS</Text>
            {section.features.map((feature, index) => (
              <Text key={index}>{feature}</Text>
            ))}
          </div>
          <div className="bg-slate-300 p-3 rounded-md">
            <Text font="semi" colVariant="primary">
              {section.title}
            </Text>
            <Text>{section.duration}</Text>
            {selectedSection === section.id && (
              <>
                <InputField
                  placeholder="Cantidad de apartamentos"
                  className="mt-2"
                  rounded="md"
                  value={apartmentCount}
                  onChange={(e) =>
                    setApartmentCount(e.target.value.replace(/\D/g, ""))
                  } // Permitir solo números
                />
                <Text>{section.quantity}</Text>
                {!isValid && numericValue > 0 && (
                  <Text className="text-red-500">
                    La cantidad de casas o apartamentos debe estar entre{" "}
                    {selectedPlan?.min} y {selectedPlan?.max}.
                  </Text>
                )}
                {isValid && total !== null && (
                  <div>
                    <Text>Total mensual: {formatCurrency(valorConIva)}</Text>
                    <Text size="xs">
                      Valor incluye impuesto al IVA del 19% segun la ley
                    </Text>

                    <div className="flex justify-center mt-2">
                      <Button colVariant="success">Realizar pago </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      ))}
    </div>
  );
}

import React, { useState } from "react";
import { Text } from "complexes-next-components";

export default function Payments() {
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  const sections = [
    {
      id: "bronze",
      borderColor: "border-red-600",
      hoverColor: "bg-red-600",
      title: "Registro Bronce",
      duration: "1 año",
      price: "2M",
      features: [
        "Registro de los usuarios del conjunto",
        "Control de actividades",
        "Chat",
        "Pagina de noticias",
        "Venta y arriendo hasta 6 inmuebles",
      ],
    },
    {
      id: "gold",
      borderColor: "border-yellow-600",
      hoverColor: "bg-yellow-600",
      title: "Registro Oro",
      duration: "2 años",
      price: "3.5M",
      features: [
        "Registro de los usuarios del conjunto",
        "Control de actividades",
        "Chat",
        "Renta inmueble vacacional",
        "Pagina de noticias",
        "Venta y arriendo hasta 20 inmuebles",
      ],
    },
    {
      id: "diamond",
      borderColor: "border-gray-600",
      hoverColor: "bg-gray-600",
      title: "Registro Diamante",
      duration: "4 años",
      price: "5M",
      features: [
        "Registro de los usuarios del conjunto",
        "Control de actividades",
        "Chat",
        "Renta inmueble vacacional",
        "Pagina de noticias",
        "Venta y arriendo sin limite",
      ],
    },
  ];

  return (
    <div className="flex gap-5 w-full justify-center mt-4">
      {sections.map((section) => (
        <section
          key={section.id}
          onClick={() => setSelectedSection(section.id)}
          className={`border-2 ${
            section.borderColor
          } rounded-lg p-6 cursor-pointer ${
            selectedSection === section.id
              ? section.hoverColor
              : "hover:" + section.hoverColor
          }`}
        >
          <div>
            {section.features.map((feature, index) => (
              <Text key={index}>{feature}</Text>
            ))}
          </div>
          <Text>{section.title}</Text>
          <Text>{section.duration}</Text>
          <Text>{section.price}</Text>
        </section>
      ))}
    </div>
  );
}

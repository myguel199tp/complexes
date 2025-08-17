"use client";
import React, { useEffect, useState } from "react";
import { Button, Flag, InputField, Text } from "complexes-next-components";
import { formatCurrency } from "@/app/_helpers/format-currency";
import paymentsInfo from "./payments-info";
import { useRegisterStore } from "../store/registerStore";
import ModalRegisterComplex from "./modal/modal";

export default function Payments() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    sections,
    selectedSection,
    setSelectedSection,
    setApartmentCount,
    apartmentCount,
    isValid,
    numericValue,
    selectedPlan,
    totalConIva,
    porapatamento,
  } = paymentsInfo();
  const { showRegistTwo } = useRegisterStore();

  // Se abre el modal automáticamente al montar el componente
  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  return (
    <div className="flex flex-col md:!flex-row gap-5 w-full justify-center mt-4">
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
                  placeholder="Cantidad de inmuebles"
                  className="mt-2"
                  rounded="md"
                  value={apartmentCount}
                  onChange={(e) =>
                    setApartmentCount(e.target.value.replace(/\D/g, ""))
                  }
                />
                <Text size="sm" colVariant="success">
                  {section.quantity}
                </Text>
                {!isValid && numericValue > 0 && (
                  <Flag colVariant="danger" color="danger">
                    <Text size="sm">
                      La cantidad de casas o apartamentos debe estar entre{" "}
                      {selectedPlan?.min} y {selectedPlan?.max}.
                    </Text>
                  </Flag>
                )}
                {isValid !== null && (
                  <div>
                    <Text size="sm" font="bold">
                      Total Mensual: {formatCurrency(totalConIva)}
                    </Text>
                    <Text size="sm">
                      Cada propietario:{" "}
                      {formatCurrency(isNaN(porapatamento) ? 0 : porapatamento)}
                    </Text>

                    <Text size="xs">
                      Valor incluye impuesto al IVA del 19% segun la ley
                    </Text>
                    <div className="flex justify-center mt-2">
                      <Button colVariant="success" onClick={showRegistTwo}>
                        Siguiente
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      ))}

      <ModalRegisterComplex
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}

import React from "react";
import { InputField, Title } from "complexes-next-components";
import Summary from "./card-summary/summary";

export default function SummaryImmovables() {
  return (
    <>
      <div className="flex justify-center">
        <div className="text-center bg-cyan-800 w-full rounded-md">
          <Title size="sm" font="bold" className="text-white">
            Apartamento en Arriendo
          </Title>
          <Title size="xs" font="semi" className="text-white">
            Fontibon, Bogotá
          </Title>
        </div>
      </div>
      <Summary />
      <div>
        <InputField className="w-full" placeholder="Descripción del inmueble" />
      </div>
      <div className="flex justify-center gap-10 mt-3 p-4">
        <div>
          <InputField className="w-full" placeholder="Números de habitaiones" />
          <InputField className="w-full mt-2" placeholder="Estrato" />
          <InputField className="w-full mt-2" placeholder="Números de Baños" />
        </div>
        <div>
          <InputField className="w-full" placeholder="Area construida" />
          <InputField
            className="w-full mt-2"
            placeholder="Valor administración"
          />
          <InputField className="w-full mt-2" placeholder="Nombre contacto" />
        </div>
        <div>
          <InputField className="w-full mt-2" placeholder="Whatsapp" />
          <InputField
            className="w-full mt-2"
            placeholder="Correo electronico"
          />
        </div>
      </div>
    </>
  );
}

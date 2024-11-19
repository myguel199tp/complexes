import React from "react";
import { Button, InputField, Title } from "complexes-next-components";
import Summary from "./card-summary/summary";

export default function SummaryImmovables() {
  return (
    <>
      <div className="flex justify-center">
        <div className="text-center">
          <Title size="sm" font="bold">
            Apartamento en Arriendo
          </Title>
          <Title size="xs" font="semi">
            Fontibon, Bogotá
          </Title>
        </div>
      </div>
      <Summary />
      <div>
        <InputField className="w-full" placeholder="Descripción del inmueble" />
      </div>
      <div className="flex justify-center gap-10 mt-6">
        <div>
          <InputField className="w-full" placeholder="Números de habitaiones" />
          <InputField className="w-full mt-2" placeholder="Estrato" />
          <InputField className="w-full mt-2" placeholder="Números de Baños" />
          <InputField className="w-full mt-2" placeholder="Area construida" />
          <InputField
            className="w-full mt-2"
            placeholder="Valor administración"
          />
        </div>
        <div>
          <Button size="full">Contactar</Button>
          <InputField className="w-full mt-4" placeholder="Nombre contacto" />
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

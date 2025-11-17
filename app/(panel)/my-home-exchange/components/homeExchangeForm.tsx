"use client";

import { InputField, Text } from "complexes-next-components";

export default function HomeExchangeForm() {
  return (
    <div>
      <Text>
        Entre los conjuntos que cuentan con el plan Platino, ofrecemos la
        oportunidad de realizar intercambios vacacionales de viviendas. A
        continuación, completa el formulario si deseas participar. Ten en cuenta
        que el intercambio solo puede realizarse entre conjuntos ubicados en
        diferentes ciudades, debe efectuarse dentro del mismo mes y es válido
        solo por un tiempo limitado.
      </Text>

      <form className="p-4 space-y-4 border rounded">
        <InputField placeholder="Nombre completo" />
      </form>
    </div>
  );
}

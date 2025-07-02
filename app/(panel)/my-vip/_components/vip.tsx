import { Text, Title } from "complexes-next-components";
import React from "react";

export default function Vip() {
  return (
    <>
      <Title font="bold">Zona VIP</Title>
      <div className="flex mt-4 justify-center">
        <div className="flex w-full justify-center">
          <div className="bg-red-400">
            <Text>Ventajas de ser vip</Text>
            <Text>Hasta 5 inmuebles activos / Trimestral - $80.000 COP</Text>
            <Text>
              Hasta 3 inmuebles vacacional activos / Trimestral - $150.000 COP
            </Text>
            <Text>
              Publicación destacada de servicios / Trimestral - $50.000 CO
            </Text>
          </div>
          <div className="bg-blue-400">
            <Text>metodo de pago</Text>
          </div>
        </div>
      </div>
    </>
  );
}

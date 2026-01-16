import { Button, InputField } from "complexes-next-components";
import React from "react";

export default function Form() {
  return (
    <div>
      <form>
        <InputField type="text" label="Nombre del proveedor" />
        <InputField type="text" label="Servicio del proveedor" />
        <InputField type="text" label="Celualr del proveedor" />
        <InputField type="text" label="Correo del proveedor" />
      </form>
      <Button size="full" colVariant="warning">
        Guargar proveedor
      </Button>
    </div>
  );
}

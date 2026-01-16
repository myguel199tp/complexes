import { Button, InputField, TextAreaField } from "complexes-next-components";
import React from "react";

export default function Form() {
  return (
    <div>
      <form>
        <InputField type="text" label="Area de mantenimiento" />
        <TextAreaField className="bg-gray-200" label="Descripcion del area" />
      </form>
      <Button size="full" colVariant="warning">
        Guargar proveedor
      </Button>
    </div>
  );
}

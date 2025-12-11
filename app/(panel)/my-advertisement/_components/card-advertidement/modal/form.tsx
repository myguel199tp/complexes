"use client";

import {
  Button,
  InputField,
  SelectField,
  TextAreaField,
} from "complexes-next-components";
import React from "react";
import useForm from "./use-form";

export default function Form() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  return (
    <div className="flex flex-col gap-4">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 p-4 rounded-xl bg-white shadow"
      >
        <SelectField
          label="Método de pago preferido"
          name="preferredPaymentMethod"
          options={[
            { label: "Efectivo", value: "cash" },
            { label: "Transferencia bancaria", value: "bank_transfer" },
            { label: "Otro", value: "other" },
          ]}
          errorMessage={errors.preferredPaymentMethod?.message}
        />

        <TextAreaField
          label="Mensaje adicional"
          placeholder="Escribe un mensaje para el vendedor..."
          {...register("message")}
          errorMessage={errors.message?.message}
        />

        <InputField
          label="Teléfono de contacto"
          placeholder="300 123 4567"
          {...register("contactPhone")}
          errorMessage={errors.contactPhone?.message}
        />

        <InputField
          label="Correo de contacto"
          placeholder="correo@ejemplo.com"
          {...register("contactEmail")}
          errorMessage={errors.contactEmail?.message}
        />

        <div className="p-3 border rounded-lg">
          <h3 className="font-semibold mb-3">Items del pedido</h3>

          <InputField
            label="Cantidad"
            type="number"
            placeholder="1"
            onChange={(e) =>
              setValue("items", [
                {
                  quantity: Number(e.target.value),
                  productId: "default-product",
                },
              ])
            }
            errorMessage={errors.items?.[0]?.quantity?.message}
          />
        </div>

        <Button className="w-full mt-4" type="submit">
          Hacer pedido
        </Button>
      </form>
    </div>
  );
}

"use client";

import {
  Button,
  InputField,
  SelectField,
  Text,
  TextAreaField,
  Title,
} from "complexes-next-components";
import React from "react";
import useForm from "./use-form";

export default function FormPayment() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm();

  return (
    <div className="flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl shadow-lg p-2 space-y-2"
      >
        {/* Pago */}
        <div>
          <Title className="text-lg font-semibold">Detalles del pago</Title>

          <SelectField
            helpText="Método de pago"
            inputSize="sm"
            name="preferredPaymentMethod"
            options={[
              { label: "Efectivo", value: "cash" },
              { label: "Transferencia bancaria", value: "bank_transfer" },
              { label: "Otro", value: "other" },
            ]}
            errorMessage={errors.preferredPaymentMethod?.message}
          />
        </div>

        {/* Contacto */}
        <div className="space-y-4">
          <Title as="h3" size="xs" font="semi">
            Información de contacto
          </Title>

          <InputField
            helpText="Celular"
            inputSize="sm"
            placeholder="Celular"
            {...register("contactPhone")}
            errorMessage={errors.contactPhone?.message}
          />

          <InputField
            helpText="Correo electrónico"
            inputSize="sm"
            placeholder="correo electronico"
            {...register("contactEmail")}
            errorMessage={errors.contactEmail?.message}
          />
        </div>

        {/* Pedido */}
        <div className="flex gap-3">
          <TextAreaField
            className="bg-gray-200"
            label="Mensaje adicional"
            placeholder="Escribe un mensaje para el vendedor..."
            {...register("message")}
            errorMessage={errors.message?.message}
          />
          <div className="bg-gray-50 border rounded-xl p-4 space-y-3">
            <Text size="sm" font="semi">
              Pedido
            </Text>

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
        </div>

        {/* CTA */}
        <Button
          className="w-full h-11 text-base font-semibold"
          colVariant="warning"
          type="submit"
        >
          Hacer pedido
        </Button>
      </form>
    </div>
  );
}

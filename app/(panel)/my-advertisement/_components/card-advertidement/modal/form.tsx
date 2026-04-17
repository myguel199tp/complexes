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
  const { register, handleSubmit, errors, fields, append, remove } = useForm();

  return (
    <div className="flex justify-center">
      <form
        onSubmit={handleSubmit}
        className="w-full rounded-2xl shadow-lg p-2 space-y-4"
      >
        <Title className="text-lg font-semibold">Detalles del pago</Title>

        <SelectField
          helpText="Método de pago"
          inputSize="sm"
          {...register("preferredPaymentMethod")}
          options={[
            { label: "Efectivo", value: "cash" },
            { label: "Transferencia bancaria", value: "bank_transfer" },
            { label: "Otro", value: "other" },
          ]}
          errorMessage={errors.preferredPaymentMethod?.message}
        />

        <div className="space-y-4">
          <Title as="h3" size="xs" font="semi">
            Información de contacto
          </Title>

          <InputField
            helpText="Celular"
            {...register("contactPhone")}
            errorMessage={errors.contactPhone?.message}
          />

          <InputField
            helpText="Correo electrónico"
            {...register("contactEmail")}
            errorMessage={errors.contactEmail?.message}
          />
        </div>

        <TextAreaField
          label="Mensaje adicional"
          {...register("message")}
          errorMessage={errors.message?.message}
        />

        {/* 🔥 PRODUCTOS */}
        <div className="bg-gray-50 border rounded-xl p-4 space-y-3">
          <Text size="sm" font="semi">
            Pedido
          </Text>

          {fields.map((field, index) => (
            <div key={field.id} className="space-y-2 border-b pb-2">
              <InputField
                label="Producto ID"
                {...register(`items.${index}.productId`)}
                errorMessage={errors.items?.[index]?.productId?.message}
              />

              <InputField
                label="Cantidad"
                type="number"
                {...register(`items.${index}.quantity`)}
                errorMessage={errors.items?.[index]?.quantity?.message}
              />

              <Button
                type="button"
                colVariant="danger"
                onClick={() => remove(index)}
              >
                Eliminar
              </Button>
            </div>
          ))}

          <Button
            type="button"
            onClick={() => append({ productId: "", quantity: 1 })}
          >
            Agregar producto
          </Button>
        </div>

        <Button
          className="w-full h-11 text-base font-semibold"
          colVariant="success"
          type="submit"
        >
          Hacer pedido
        </Button>
      </form>
    </div>
  );
}

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
import {
  PAYMENT_METHOD_LABELS,
  PaymentMethod,
} from "../../../services/request/orderRequest";

/**
 * Datos de contacto y forma de pago del pedido.
 *
 * Ya no hay campos de "Producto ID" ni "Cantidad": los productos salen del
 * carrito. Pedirle al comprador que escribiera a mano el UUID de un producto
 * era, en la práctica, un checkout que nadie podía completar.
 */
export default function FormPayment() {
  const { register, handleSubmit, errors, isEmpty, sellerCount, isLoading } =
    useForm();

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3 p-1">
      <Title className="text-base font-semibold">Datos del pedido</Title>

      <Text size="xs" className="text-gray-500">
        El pago se acuerda directamente con el vendedor. Aquí solo dejas el
        pedido y tus datos de contacto.
      </Text>

      <SelectField
        helpText="¿Cómo piensas pagar?"
        inputSize="sm"
        {...register("preferredPaymentMethod")}
        options={Object.values(PaymentMethod).map((value) => ({
          label: PAYMENT_METHOD_LABELS[value],
          value,
        }))}
        errorMessage={errors.preferredPaymentMethod?.message}
      />

      <InputField
        regexType="alphanumeric"
        helpText="Apartamento / unidad"
        inputSize="sm"
        {...register("unitId")}
        errorMessage={errors.unitId?.message}
      />

      <InputField
        regexType="phone"
        helpText="Celular"
        inputSize="sm"
        {...register("contactPhone")}
        errorMessage={errors.contactPhone?.message}
      />

      <InputField
        regexType="email"
        helpText="Correo electrónico"
        inputSize="sm"
        {...register("contactEmail")}
        errorMessage={errors.contactEmail?.message}
      />

      <TextAreaField
        label="Mensaje para el vendedor"
        className="mt-2 w-full rounded-md border bg-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
        {...register("message")}
        errorMessage={errors.message?.message}
      />

      {sellerCount > 1 && (
        <Text size="xs" className="text-amber-600">
          Tu carrito tiene productos de {sellerCount} negocios. Se enviará un
          pedido a cada uno, y cada vendedor confirma el suyo por separado.
        </Text>
      )}

      <Button
        className="w-full h-11 text-base font-semibold"
        colVariant="success"
        type="submit"
        disabled={isEmpty || isLoading}
      >
        {isLoading
          ? "Enviando..."
          : isEmpty
            ? "Agrega productos al carrito"
            : sellerCount > 1
              ? `Enviar ${sellerCount} pedidos`
              : "Hacer pedido"}
      </Button>
    </form>
  );
}

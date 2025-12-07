"use client";
import {
  Button,
  InputField,
  SelectField,
  TextAreaField,
} from "complexes-next-components";
import React, { useState } from "react";

export default function Form() {
  const [formData, setFormData] = useState<any>({});
  const [showSummary, setShowSummary] = useState(false); // 👈 NUEVO

  const paymentMethods = [
    { label: "Efectivo", value: "CASH" },
    { label: "Nequi", value: "NEQUI" },
    { label: "Bancolombia", value: "BANCOLOMBIA" },
    { label: "Daviplata", value: "DAVIPLATA" },
  ];

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSendOrder = () => {
    setShowSummary(true); // 👈 OCULTA EL FORM Y MUESTRA EL RESUMEN
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ✔ FORMULARIO — solo se muestra si showSummary === false */}
      {!showSummary && (
        <form
          className="flex flex-col gap-4 p-4 rounded-xl bg-white shadow"
          onSubmit={handleSendOrder}
        >
          <SelectField
            label="Método de pago preferido"
            name="preferredPaymentMethod"
            options={paymentMethods}
            onChange={handleChange}
          />

          <TextAreaField
            label="Mensaje adicional (opcional)"
            name="message"
            placeholder="Escribe un mensaje para el vendedor..."
            onChange={handleChange}
          />

          <InputField
            label="Teléfono de contacto"
            name="contactPhone"
            placeholder="300 123 4567"
            onChange={handleChange}
          />

          <InputField
            label="Correo de contacto"
            name="contactEmail"
            placeholder="correo@ejemplo.com"
            onChange={handleChange}
          />

          <div className="p-3 border rounded-lg">
            <h3 className="font-semibold mb-3">Items del pedido</h3>

            <InputField
              label="Cantidad"
              name="quantity"
              type="number"
              placeholder="1"
              onChange={handleChange}
            />
          </div>

          <Button className="w-full mt-4" type="submit">
            Enviar orden
          </Button>
        </form>
      )}

      {/* ✔ RESUMEN — solo se muestra si showSummary === true */}
      {showSummary && (
        <div className="p-4 rounded-lg border bg-gray-50 mt-2">
          <h2 className="text-lg font-semibold mb-3">Resumen de la orden</h2>

          <p>
            <strong>Método de pago:</strong>{" "}
            {formData.preferredPaymentMethod || "—"}
          </p>
          <p>
            <strong>Mensaje:</strong> {formData.message || "—"}
          </p>
          <p>
            <strong>Teléfono:</strong> {formData.contactPhone || "—"}
          </p>
          <p>
            <strong>Correo:</strong> {formData.contactEmail || "—"}
          </p>
          <p>
            <strong>Cantidad:</strong> {formData.quantity || "—"}
          </p>

          <Button className="w-full mt-4">Aceptar y enviar</Button>
        </div>
      )}
    </div>
  );
}

"use client";

import {
  InputField,
  Modal,
  SelectField,
  Text,
  Button,
} from "complexes-next-components";
import React, { useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalPayHoliday({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    method: "",
    country: "",
    accountType: "",
    bank: "",
    accountNumber: "",
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/payments/info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) throw new Error("Error al guardar los datos");

      console.log("Datos enviados:", form);
      onClose();
    } catch (err) {
      console.error(err);
      alert("Hubo un error al guardar la información de pago.");
    } finally {
      setLoading(false);
    }
  };

  const countries = [
    { label: "Canadá", value: "CA" },
    { label: "Estados Unidos", value: "US" },
    { label: "México", value: "MX" },
    { label: "Colombia", value: "CO" },
    { label: "Chile", value: "CL" },
    { label: "Argentina", value: "AR" },
    { label: "Brasil", value: "BR" },
    { label: "Perú", value: "PE" },
  ];

  const renderCountryFields = () => {
    switch (form.country) {
      case "US":
      case "CA":
        return (
          <>
            <InputField
              helpText="Número de cuenta"
              sizeHelp="sm"
              placeholder="Número de cuenta"
              value={form.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
            />
            <InputField
              helpText="Routing / Transit Number"
              sizeHelp="sm"
              placeholder="Routing / Transit Number"
            />
          </>
        );
      case "MX":
        return (
          <InputField
            helpText="CLABE (18 dígitos)"
            sizeHelp="sm"
            placeholder="CLABE (18 dígitos)"
            value={form.accountNumber}
            onChange={(e) => handleChange("accountNumber", e.target.value)}
          />
        );
      case "CO":
        return (
          <>
            <SelectField
              helpText="Tipo de cuenta"
              sizeHelp="sm"
              defaultOption="Tipo de cuenta"
              options={[
                { label: "Ahorros", value: "ahorros" },
                { label: "Corriente", value: "corriente" },
              ]}
              value={form.accountType}
              onChange={(e) => handleChange("accountType", e.target.value)}
            />
            <SelectField
              helpText="Banco"
              sizeHelp="sm"
              defaultOption="Banco"
              options={[
                { label: "Bancolombia", value: "bancolombia" },
                { label: "Davivienda", value: "davivienda" },
                { label: "BBVA", value: "bbva" },
                { label: "Nequi", value: "nequi" },
                { label: "Daviplata", value: "daviplata" },
              ]}
              value={form.bank}
              onChange={(e) => handleChange("bank", e.target.value)}
            />
            <InputField
              helpText="Número de cuenta o teléfono"
              sizeHelp="sm"
              placeholder="Número de cuenta o teléfono"
              value={form.accountNumber}
              onChange={(e) => handleChange("accountNumber", e.target.value)}
            />
          </>
        );
      default:
        return (
          <InputField
            sizeHelp="sm"
            helpText="Número o identificación bancaria"
            placeholder="Número o identificación bancaria"
          />
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Datos de pago"
      closeOnOverlayClick={false}
      className="w-[1000px] h-auto"
    >
      <div className="space-y-4">
        <Text>
          Por favor, ingresa los datos donde deseas recibir el pago. Ten en
          cuenta que el pago se realizará una vez que el huésped haya ocupado el
          inmueble.
        </Text>
        <Text>
          Los costos asociados a la transacción se descontarán del monto total.
        </Text>

        <InputField
          helpText="Nombre completo del titular"
          sizeHelp="sm"
          placeholder="Nombre completo del titular"
          value={form.name}
          onChange={(e) => handleChange("name", e.target.value)}
        />

        <InputField
          helpText="Correo electrónico (PayPal o confirmación)"
          sizeHelp="sm"
          placeholder="Correo electrónico (PayPal o confirmación)"
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />

        <SelectField
          helpText="Método de pago"
          sizeHelp="sm"
          defaultOption="Método de pago"
          options={[
            { label: "Transferencia bancaria", value: "bank" },
            { label: "PayPal", value: "paypal" },
            { label: "Wise", value: "wise" },
          ]}
          value={form.method}
          onChange={(e) => handleChange("method", e.target.value)}
        />

        {form.method === "bank" && (
          <>
            <SelectField
              helpText="País del banco"
              sizeHelp="sm"
              defaultOption="País del banco"
              options={countries}
              value={form.country}
              onChange={(e) => handleChange("country", e.target.value)}
            />
            {form.country && (
              <div className="mt-2 border-t pt-3 space-y-2">
                {renderCountryFields()}
              </div>
            )}
          </>
        )}

        {form.method === "paypal" && (
          <InputField
            helpText="Correo asociado a tu cuenta PayPal"
            sizeHelp="sm"
            placeholder="Correo asociado a tu cuenta PayPal"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        )}

        {form.method === "wise" && (
          <InputField
            helpText="Correo o número asociado a tu cuenta Wise"
            sizeHelp="sm"
            placeholder="Correo o número asociado a tu cuenta Wise"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        )}

        <div className="mt-6 flex justify-end gap-3">
          <Button onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Guardando..." : "Guardar información"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

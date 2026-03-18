"use client";

import { useState } from "react";
import {
  Button,
  InputField,
  Modal,
  SelectField,
  TextAreaField,
} from "complexes-next-components";
import { ImSpinner9 } from "react-icons/im";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessPartnerForm({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    companyName: "",
    nit: "",
    representativeName: "",
    phone: "",
    email: "",
    discountType: "",
    discountValue: "",
    description: "",
    category: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.companyName || !form.email) {
      alert("Por favor completa los campos obligatorios");
      return;
    }

    try {
      setLoading(true);

      console.log("Enviar datos:", form);

      alert("Solicitud enviada correctamente");
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error enviando formulario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registro Empresa Aliada"
      className="w-full max-w-4xl h-auto max-h-[95vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            placeholder="Nombre de la empresa *"
            helpText="Nombre de la empresa *"
            inputSize="xs"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
          />

          <InputField
            placeholder="NIT / RUT"
            helpText="NIT / RUT"
            inputSize="xs"
            name="nit"
            value={form.nit}
            onChange={handleChange}
          />

          <InputField
            placeholder="Nombre del representante"
            helpText="Nombre del representante"
            inputSize="xs"
            name="representativeName"
            value={form.representativeName}
            onChange={handleChange}
          />

          <InputField
            placeholder="Teléfono"
            helpText="Teléfono"
            inputSize="xs"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />

          <InputField
            placeholder="Email"
            helpText="Email"
            inputSize="xs"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mb-2"
          />

          <InputField
            placeholder="Categoría"
            helpText="Categoría"
            inputSize="xs"
            name="category"
            value={form.category}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 space-y-2 md:grid-cols-2 gap-4">
          <SelectField
            helpText="Tipo de descuento"
            name="discountType"
            inputSize="md"
            value={form.discountType}
            onChange={handleChange}
            options={[
              { value: "%", label: "Porcentaje (%)" },
              { value: "$", label: "Valor fijo ($)" },
            ]}
          />

          <InputField
            helpText="Valor del descuento"
            placeholder="Valor del descuento"
            name="discountValue"
            inputSize="xs"
            value={form.discountValue}
            onChange={handleChange}
          />
        </div>

        <TextAreaField
          helpText="Descripción del beneficio o alianza"
          placeholder="Describe el beneficio para los residentes..."
          name="description"
          value={form.description}
          onChange={handleChange}
          className="min-h-[120px] bg-gray-200"
        />

        <Button
          type="submit"
          disabled={loading}
          colVariant="warning"
          className="mt-3"
          size="full"
        >
          Enviar solicitud
          {loading && <ImSpinner9 className="animate-spin" />}
        </Button>
      </form>
    </Modal>
  );
}

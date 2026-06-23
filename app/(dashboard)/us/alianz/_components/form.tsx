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
import { useAlertStore } from "@/app/components/store/useAlertStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function BusinessPartnerForm({ isOpen, onClose }: Props) {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    // 🧾 Básico
    companyName: "",
    contactName: "",
    phone: "",
    email: "",

    // 📍 Ubicación
    city: "",
    address: "",

    // 🧩 Negocio
    category: "",
    description: "",

    // 💰 Beneficio
    discountType: "",
    discountValue: "",
    conditions: "",

    // 📣 Visibilidad
    instagram: "",
    website: "",

    // 🎯 Objetivo
    objective: "",
  });
  const showAlert = useAlertStore((state) => state.showAlert);

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

    if (
      !form.companyName ||
      !form.email ||
      !form.discountType ||
      !form.discountValue
    ) {
      showAlert("Completa los campos obligatorios", "info");
      return;
    }

    try {
      setLoading(true);

      showAlert("Solicitud enviada correctamente", "success");
      onClose();
    } catch (error) {
      console.error(error);
      showAlert("Error enviando formulario", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Postular mi negocio como aliado"
      className="w-full max-w-4xl h-auto max-h-[95vh] overflow-y-auto"
    >
      <form onSubmit={handleSubmit}>
        {/* 🧾 DATOS BÁSICOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InputField
            placeholder="Nombre del negocio *"
            helpText="Nombre del negocio"
            inputSize="xs"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
          />

          <InputField
            placeholder="Nombre de contacto"
            helpText="Persona de contacto"
            inputSize="xs"
            name="contactName"
            value={form.contactName}
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
            placeholder="Email *"
            helpText="Email"
            inputSize="xs"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {/* 📍 UBICACIÓN */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <InputField
            placeholder="Ciudad *"
            helpText="Ciudad"
            inputSize="xs"
            name="city"
            value={form.city}
            onChange={handleChange}
          />

          <InputField
            placeholder="Dirección del negocio"
            helpText="Dirección"
            inputSize="xs"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        {/* 🧩 NEGOCIO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <SelectField
            helpText="Categoría *"
            name="category"
            inputSize="md"
            value={form.category}
            onChange={handleChange}
            options={[
              { value: "restaurante", label: "Restaurante" },
              { value: "cafeteria", label: "Cafetería" },
              { value: "gimnasio", label: "Gimnasio" },
              { value: "belleza", label: "Belleza / Spa" },
              { value: "salud", label: "Salud" },
              { value: "servicios", label: "Servicios" },
              { value: "retail", label: "Retail" },
              { value: "otro", label: "Otro" },
            ]}
          />

          <SelectField
            helpText="¿Qué buscas con esta alianza?"
            name="objective"
            inputSize="md"
            value={form.objective}
            onChange={handleChange}
            options={[
              { value: "clientes", label: "Conseguir nuevos clientes" },
              { value: "visibilidad", label: "Dar a conocer mi marca" },
              { value: "ventas", label: "Aumentar ventas" },
              { value: "fidelizacion", label: "Fidelizar clientes" },
            ]}
          />
        </div>

        <TextAreaField
          helpText="Descripción del negocio *"
          placeholder="Cuéntanos qué ofrece tu negocio..."
          name="description"
          value={form.description}
          onChange={handleChange}
          className="mt-4 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 💰 BENEFICIO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <SelectField
            helpText="Tipo de beneficio *"
            name="discountType"
            inputSize="md"
            value={form.discountType}
            onChange={handleChange}
            options={[
              { value: "%", label: "Descuento (%)" },
              { value: "$", label: "Valor fijo ($)" },
              { value: "promo", label: "Promoción (ej: 2x1)" },
            ]}
          />

          <InputField
            helpText="Valor del beneficio *"
            placeholder="Ej: 10, 20000, 2x1"
            name="discountValue"
            inputSize="xs"
            value={form.discountValue}
            onChange={handleChange}
          />
        </div>

        <TextAreaField
          helpText="Condiciones (opcional)"
          placeholder="Ej: válido de lunes a viernes, no acumulable..."
          name="conditions"
          value={form.conditions}
          onChange={handleChange}
          className="mt-4 w-full rounded-md border bg-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {/* 📣 VISIBILIDAD */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <InputField
            placeholder="Instagram"
            helpText="Instagram"
            inputSize="xs"
            name="instagram"
            value={form.instagram}
            onChange={handleChange}
          />

          <InputField
            placeholder="Página web"
            helpText="Sitio web"
            inputSize="xs"
            name="website"
            value={form.website}
            onChange={handleChange}
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
          <Button type="button" colVariant="default" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            colVariant="success"
            size="sm"
          >
            Postular mi negocio
            {loading && <ImSpinner9 className="animate-spin" />}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

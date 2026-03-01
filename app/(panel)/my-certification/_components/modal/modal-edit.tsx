import { Modal, Title, Text, Button } from "complexes-next-components";
import React, { useEffect, useState } from "react";
import { Pencil } from "lucide-react";

export interface Certification {
  id: string;
  title: string;
  nameUnit: string;
  isPublic: boolean;
  file: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  item: Certification | null;
  onSubmit?: (data: Certification) => void;
}

export default function ModalEdit({ isOpen, onClose, item, onSubmit }: Props) {
  const [form, setForm] = useState<Certification>({
    id: "",
    title: "",
    nameUnit: "",
    isPublic: false,
    file: "",
  });

  useEffect(() => {
    if (item) {
      setForm(item);
    }
  }, [item]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim()) return;

    onSubmit?.(form);
    onClose();
  };

  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={false}
      className="w-full max-w-2xl p-6 rounded-2xl"
    >
      <div className="flex items-center gap-2 mb-4">
        <Pencil className="text-blue-600" size={22} />
        <Title as="h2" className="text-xl font-bold">
          Editar Certificación
        </Title>
      </div>

      <Text size="sm" className="text-gray-600 mb-6">
        Aquí puedes modificar la información de la certificación.
      </Text>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Título</label>
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded-lg"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="isPublic"
            checked={form.isPublic}
            onChange={handleChange}
          />
          <label className="text-sm">¿Es público?</label>
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex justify-end gap-3 mt-6">
        <Button
          onClick={onClose}
          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition"
        >
          Cancelar
        </Button>

        <Button
          onClick={handleSubmit}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
        >
          Guardar cambios
        </Button>
      </div>
    </Modal>
  );
}

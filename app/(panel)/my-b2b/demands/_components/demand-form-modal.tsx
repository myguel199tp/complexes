"use client";

import { useEffect, useState } from "react";
import {
  Button,
  InputField,
  Modal,
  SelectField,
  TextAreaField,
  Text,
} from "complexes-next-components";
import DateField from "@/app/components/ui/date-field/DateField";
import {
  B2B_DEMAND_CATEGORIES,
  B2bDemand,
  B2bDemandCategory,
  CreateB2bDemandPayload,
  DEMAND_DESCRIPTION_MIN,
} from "../../services/b2bDemandService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Cuando viene, el modal edita esa convocatoria en vez de crear una nueva. */
  demand?: B2bDemand | null;
  isSaving: boolean;
  onSubmit: (payload: CreateB2bDemandPayload) => void;
}

const EMPTY = {
  category: "" as B2bDemandCategory | "",
  categoryOther: "",
  title: "",
  description: "",
  desiredStartDate: "",
};

/**
 * Alta y edición de una necesidad de servicio.
 *
 * Al editar, la categoría queda bloqueada: los conjuntos que ya se sumaron lo
 * hicieron por un servicio concreto y cambiarlo por debajo convertiría su
 * adhesión en algo que nunca aceptaron. El backend la rechaza igual.
 */
export function DemandFormModal({
  isOpen,
  onClose,
  demand,
  isSaving,
  onSubmit,
}: Props) {
  const isEdit = !!demand;
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setForm(
      demand
        ? {
            category: demand.category,
            categoryOther: demand.categoryOther ?? "",
            title: demand.title,
            description: demand.description,
            desiredStartDate: demand.desiredStartDate?.slice(0, 10) ?? "",
          }
        : EMPTY,
    );
  }, [isOpen, demand]);

  const set = <K extends keyof typeof EMPTY>(key: K, value: (typeof EMPTY)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const missingDescription = Math.max(
    0,
    DEMAND_DESCRIPTION_MIN - form.description.trim().length,
  );

  const handleSubmit = () => {
    if (!form.category) return setError("Elige el servicio que necesitas.");
    if (form.category === "otro" && !form.categoryOther.trim()) {
      return setError("Escribe qué servicio necesitas.");
    }
    if (form.title.trim().length < 10) {
      return setError("El título debe tener al menos 10 caracteres.");
    }
    if (missingDescription > 0) {
      return setError(
        `Faltan ${missingDescription} caracteres en la descripción.`,
      );
    }

    setError(null);
    onSubmit({
      category: form.category as B2bDemandCategory,
      categoryOther:
        form.category === "otro" ? form.categoryOther.trim() : undefined,
      title: form.title.trim(),
      description: form.description.trim(),
      desiredStartDate: form.desiredStartDate || undefined,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Editar necesidad" : "Publicar una necesidad"}
    >
      <div className="space-y-4 p-2">
        <Text size="sm" className="text-slate-400">
          Describe qué necesita tu conjunto. Los conjuntos de tu ciudad podrán
          sumarse y el equipo del club negociará el precio con el volumen de
          todos. No hace falta que pongas precio: de eso se trata la
          negociación.
        </Text>

        <div>
          <label className="text-xs text-slate-400">Servicio</label>
          <SelectField
            options={B2B_DEMAND_CATEGORIES.map((c) => ({
              label: c.label,
              value: c.value,
            }))}
            defaultOption="Selecciona el servicio"
            value={form.category}
            onChange={(e) => set("category", e.target.value as B2bDemandCategory)}
            disabled={isEdit}
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
          />
          {isEdit ? (
            <Text size="xs" className="text-slate-500 mt-1">
              El servicio no se puede cambiar: los conjuntos que ya se sumaron lo
              hicieron por este.
            </Text>
          ) : null}
        </div>

        {form.category === "otro" && !isEdit ? (
          <InputField
            placeholder="¿Qué servicio necesitas?"
            value={form.categoryOther}
            onChange={(e) => set("categoryOther", e.target.value)}
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
          />
        ) : null}

        <div>
          <label className="text-xs text-slate-400">Título</label>
          <InputField
            placeholder="Ej: Pintura y arreglo de fachada de 3 torres"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">Descripción</label>
          <TextAreaField
            placeholder="Qué hay que hacer, estado actual, metros aproximados, condiciones..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm"
          />
          <Text size="sm"
            className={`text-xs mt-1 ${
              missingDescription > 0 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {missingDescription > 0
              ? `Faltan ${missingDescription} caracteres`
              : "Descripción suficiente"}
          </Text>
        </div>

        <DateField
          label="Fecha deseada de inicio (opcional)"
          value={form.desiredStartDate}
          onChange={(value) => set("desiredStartDate", value)}
          minDate={new Date()}
          size="small"
        />

        {error ? <Text size="sm" colVariant="danger">{error}</Text> : null}

        <div className="flex justify-end gap-2">
          <Button colVariant="default" size="sm" rounded="md" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            colVariant="primary"
            size="sm"
            rounded="md"
            disabled={isSaving}
            onClick={handleSubmit}
          >
            {isSaving ? "Guardando..." : isEdit ? "Guardar" : "Publicar"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

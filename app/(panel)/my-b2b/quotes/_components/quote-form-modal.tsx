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
import {
  B2B_SERVICE_CATEGORIES,
  type B2bServiceCategory,
} from "@/app/helpers/b2bServiceCategories";
import {
  CreateB2bQuoteInput,
  QUOTE_DESCRIPTION_MIN,
} from "../../services/b2bQuoteService";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  isSaving: boolean;
  /** Proveedor al que se le pide. Fijo cuando se llega desde su ficha. */
  comercioId: string;
  comercioName?: string;
  onSubmit: (payload: CreateB2bQuoteInput) => void;
}

const EMPTY = {
  category: "" as B2bServiceCategory | "",
  categoryOther: "",
  title: "",
  description: "",
  desiredStartDate: "",
};

/**
 * Solicitud de cotización.
 *
 * A diferencia de una convocatoria de demanda agregada —que es pública y busca
 * que otros conjuntos se sumen—, esto va dirigido a un proveedor concreto. Por
 * eso no pide presupuesto: el precio es justamente lo que se está pidiendo.
 */
export function QuoteFormModal({
  isOpen,
  onClose,
  isSaving,
  comercioId,
  comercioName,
  onSubmit,
}: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setForm(EMPTY);
    setError(null);
  }, [isOpen]);

  const set = <K extends keyof typeof EMPTY>(
    key: K,
    value: (typeof EMPTY)[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const missingDescription = Math.max(
    0,
    QUOTE_DESCRIPTION_MIN - form.description.trim().length,
  );

  const handleSubmit = () => {
    if (!form.category) return setError("Elige el servicio que necesitas.");
    if (form.category === "otro" && !form.categoryOther.trim()) {
      return setError("Escribe qué servicio necesitas.");
    }
    if (form.title.trim().length < 5) {
      return setError("El título debe tener al menos 5 caracteres.");
    }
    if (missingDescription > 0) {
      return setError(
        `Faltan ${missingDescription} caracteres en la descripción.`,
      );
    }

    setError(null);
    onSubmit({
      comercioId,
      category: form.category as B2bServiceCategory,
      categoryOther:
        form.category === "otro" ? form.categoryOther.trim() : undefined,
      title: form.title.trim(),
      description: form.description.trim(),
      desiredStartDate: form.desiredStartDate || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Pedir una cotización">
      <div className="space-y-4 p-2">
        <Text size="sm" className="text-slate-400">
          {comercioName
            ? `Le pedirás una cotización a ${comercioName}. `
            : ""}
          Describe con detalle qué hay que hacer: entre mejor esté descrito,
          menos vueltas antes del precio. El proveedor puede agendar una visita
          técnica antes de cotizar.
        </Text>

        <div>
          <label className="text-xs text-slate-400">Servicio</label>
          <SelectField
            options={B2B_SERVICE_CATEGORIES.map((c) => ({
              label: c.label,
              value: c.value,
            }))}
            defaultOption="Selecciona el servicio"
            value={form.category}
            onChange={(e) =>
              set("category", e.target.value as B2bServiceCategory)
            }
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
          />
        </div>

        {form.category === "otro" ? (
          <InputField
            regexType="safeChars"
            placeholder="¿Qué servicio necesitas?"
            value={form.categoryOther}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              set("categoryOther", e.target.value)
            }
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
          />
        ) : null}

        <div>
          <label className="text-xs text-slate-400">Título</label>
          <InputField
            regexType="safeChars"
            placeholder="Ej: Impermeabilizar la cubierta de la torre 2"
            value={form.title}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              set("title", e.target.value)
            }
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
          />
        </div>

        <div>
          <label className="text-xs text-slate-400">Qué se necesita</label>
          <TextAreaField
            placeholder="Estado actual, metros aproximados, accesos, horarios de trabajo permitidos..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            className="w-full rounded-md border bg-gray-200 px-3 py-2 text-sm"
          />
          <Text
            size="sm"
            className={`text-xs mt-1 ${
              missingDescription > 0 ? "text-amber-400" : "text-emerald-400"
            }`}
          >
            {missingDescription > 0
              ? `Faltan ${missingDescription} caracteres`
              : "Descripción suficiente"}
          </Text>
        </div>

        <div>
          <label className="text-xs text-slate-400">
            ¿Cuándo te gustaría empezar? (opcional)
          </label>
          <InputField
            type="date"
            value={form.desiredStartDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              set("desiredStartDate", e.target.value)
            }
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
          />
        </div>

        {error ? (
          <Text size="sm" colVariant="danger">
            {error}
          </Text>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <Button size="sm" rounded="md" colVariant="default" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            size="sm"
            rounded="md"
            colVariant="success"
            disabled={isSaving}
            onClick={handleSubmit}
          >
            {isSaving ? "Enviando..." : "Pedir cotización"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

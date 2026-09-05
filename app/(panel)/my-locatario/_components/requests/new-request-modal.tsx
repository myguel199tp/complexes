"use client";

import React, { useRef } from "react";
import {
  Modal,
  InputField,
  SelectField,
  TextAreaField,
  Button,
  Text,
} from "complexes-next-components";
import { MdAttachFile, MdClose } from "react-icons/md";

import { NewRequestValues, useNewRequestForm } from "./use-new-request-form";
import { REQUEST_TYPE_LABEL } from "../../services/response/contractRequestResponse";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  /** Se muestra como aviso: el reporte va a quedar radicado ante la compañía. */
  insurerName?: string;
}

const TYPE_OPTIONS = (
  Object.keys(REQUEST_TYPE_LABEL) as (keyof typeof REQUEST_TYPE_LABEL)[]
).map((value) => ({ value, label: REQUEST_TYPE_LABEL[value] }));

const PRIORITY_OPTIONS = [
  { value: "LOW", label: "Baja" },
  { value: "MEDIUM", label: "Media" },
  { value: "HIGH", label: "Alta" },
  { value: "URGENT", label: "Urgente" },
];

export default function NewRequestModal({
  isOpen,
  onClose,
  insurerName,
}: Props) {
  const {
    register,
    watch,
    setValue,
    onSubmit,
    errors,
    files,
    addFiles,
    removeFile,
    fileError,
    isSubmitting,
  } = useNewRequestForm(onClose);

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reportar daño o solicitud"
      className="max-w-2xl w-full"
    >
      <form onSubmit={onSubmit}>
        {/* El scroll vive aquí y no en el <form> para que los botones queden
            siempre visibles: en pantallas cortas el de radicar se iba fuera. */}
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {insurerName && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200">
              <Text size="xs" className="text-purple-800">
                Este inmueble lo administra <strong>{insurerName}</strong>. Al
                radicar, el reporte se le envía con número de radicado y las
                evidencias adjuntas.
              </Text>
            </div>
          )}

          {/* SelectField no es un <select> nativo: emite
            onChange({ target: { value } }) sin `name` y pinta lo que reciba en
            `value`, así que con solo `register` se quedaba en "Seleccione una
            opción" aunque el formulario tuviera un valor por defecto. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SelectField
              {...register("type")}
              value={watch("type") ?? ""}
              onChange={(e) =>
                setValue("type", e.target.value as NewRequestValues["type"], {
                  shouldValidate: true,
                })
              }
              label="Tipo"
              defaultOption="Tipo de solicitud"
              options={TYPE_OPTIONS}
              inputSize="full"
              rounded="md"
              hasError={!!errors.type}
              errorMessage={errors.type?.message}
            />

            <SelectField
              {...register("priority")}
              value={watch("priority") ?? ""}
              onChange={(e) =>
                setValue(
                  "priority",
                  e.target.value as NewRequestValues["priority"],
                  { shouldValidate: true },
                )
              }
              label="Prioridad"
              defaultOption="Prioridad"
              options={PRIORITY_OPTIONS}
              inputSize="full"
              rounded="md"
              hasError={!!errors.priority}
              errorMessage={errors.priority?.message}
            />
          </div>

          <InputField
            regexType="safeChars"
            placeholder="Ej: Fuga en el lavaplatos"
            helpText="Título"
            sizeHelp="xs"
            inputSize="full"
            rounded="md"
            {...register("title")}
            hasError={!!errors.title}
            errorMessage={errors.title?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <InputField
              regexType="safeChars"
              placeholder="Plomería, eléctrico, humedad…"
              helpText="Categoría (opcional)"
              sizeHelp="xs"
              inputSize="full"
              rounded="md"
              {...register("category")}
            />

            <InputField
              regexType="safeChars"
              placeholder="Cocina, baño principal, patio…"
              helpText="Ubicación (opcional)"
              sizeHelp="xs"
              inputSize="full"
              rounded="md"
              {...register("location")}
            />
          </div>

          <TextAreaField
            placeholder="Qué pasó, desde cuándo y en qué parte del inmueble"
            helpText="Descripción"
            sizeHelp="xs"
            rows={4}
            {...register("description")}
            hasError={!!errors.description}
            errorMessage={errors.description?.message}
          />

          {/* EVIDENCIAS */}
          <div className="border border-dashed border-gray-300 bg-gray-50 p-4 rounded-xl space-y-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 text-sm text-blue-600"
            >
              <MdAttachFile size={20} />
              Adjuntar fotos o cotización (máx. 6)
            </button>

            <input
              type="file"
              hidden
              multiple
              ref={fileInputRef}
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => {
                addFiles(e.target.files);
                // Sin esto, volver a elegir el mismo archivo no dispara onChange.
                e.target.value = "";
              }}
            />

            {files.length > 0 && (
              <ul className="space-y-1">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between text-xs bg-white border rounded-lg px-3 py-2"
                  >
                    <span className="truncate">{file.name}</span>

                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      aria-label={`Quitar ${file.name}`}
                    >
                      <MdClose size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {fileError && (
              <Text size="xs" colVariant="danger">
                {fileError}
              </Text>
            )}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-4 mt-4 border-t border-gray-200">
          <Button type="button" onClick={onClose} rounded="md">
            Cancelar
          </Button>

          <Button
            type="submit"
            colVariant="success"
            rounded="md"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Radicando..." : "Radicar solicitud"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

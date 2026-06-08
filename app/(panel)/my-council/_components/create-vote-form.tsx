"use client";
import { Button, InputField, TextAreaField } from "complexes-next-components";
import { useCreateVoteForm } from "./use-create-vote-form";

interface CreateVoteFormProps {
  meetingId: string;
  onSuccess?: () => void;
}

export default function CreateVoteForm({ meetingId, onSuccess }: CreateVoteFormProps) {
  const {
    register,
    handleSubmit,
    formState,
    fields,
    append,
    remove,
    isPending,
  } = useCreateVoteForm(meetingId, onSuccess);
  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit} className="space-y-4  p-6 rounded-xl shadow">
      <InputField
        placeholder="Título de la votación"
        helpText="Título"
        inputSize="sm"
        {...register("title")}
        errorMessage={errors.title?.message}
      />
      <TextAreaField
        rows={2}
        placeholder="Descripción de la votación..."
        {...register("description")}
        errorMessage={errors.description?.message}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">Opciones de voto</p>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <div className="flex-1">
              <InputField
                placeholder={`Opción ${index + 1}`}
                inputSize="sm"
                {...register(`options.${index}.label`)}
                errorMessage={errors.options?.[index]?.label?.message}
              />
            </div>
            {fields.length > 2 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700 text-sm font-medium shrink-0"
              >
                Eliminar
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={append}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          + Agregar opción
        </button>
        {errors.options?.message && (
          <p className="text-xs text-red-500">{errors.options.message}</p>
        )}
      </div>

      <Button
        type="submit"
        size="full"
        colVariant="success"
        rounded="md"
        disabled={isPending}
      >
        {isPending ? "Creando..." : "Crear votación"}
      </Button>
    </form>
  );
}

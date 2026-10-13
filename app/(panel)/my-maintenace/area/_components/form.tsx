import { Button } from "complexes-next-components";
import React from "react";
import { useFormArea } from "./use-form";
import { InputField, TextAreaField } from "@/app/components/ui/form";

export default function Form() {
  const { register, handleSubmit, errors, isSubmitting } = useFormArea();

  return (
    <div className="mt-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-4">
      <form onSubmit={handleSubmit}>
        <InputField
          regexType="safeChars"
          type="text"
          helpText="Área de mantenimiento"
          placeholder="Área de mantenimiento"
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          {...register("name")}
          errorMessage={errors.name?.message}
        />

        <TextAreaField
          className="mt-2 w-full"
          placeholder="Descripción del área"
          label="Descripción del área"
          {...register("description")}
          errorMessage={errors.description?.message}
        />

        <Button
          type="submit"
          size="full"
          colVariant="success"
          rounded="md"
          className="mt-4 !py-3 text-base font-semibold shadow-md hover:shadow-lg transition-shadow"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar Área"}
        </Button>
      </form>
    </div>
  );
}

import { Button, InputField, TextAreaField } from "complexes-next-components";
import React from "react";
import { useFormArea } from "./use-form";

export default function Form() {
  const { register, handleSubmit, errors, isSubmitting } = useFormArea();

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmit}>
        <InputField
          type="text"
          helpText="Área de mantenimiento"
          placeholder="Área de mantenimiento"
          {...register("name")}
          errorMessage={errors.name?.message}
        />

        <TextAreaField
          className="bg-gray-200"
          placeholder="Descripción del área"
          label="Descripción del área"
          {...register("description")}
          errorMessage={errors.description?.message}
        />

        <Button
          type="submit"
          size="full"
          colVariant="warning"
          className="mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar Área"}
        </Button>
      </form>
    </div>
  );
}

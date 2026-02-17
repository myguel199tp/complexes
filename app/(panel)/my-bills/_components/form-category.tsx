"use client";

import { Button, InputField, TextAreaField } from "complexes-next-components";
import { useFormCategoty } from "./use-category-form";

export default function ExpenseCategoryFormLayout() {
  const {
    register,
    formState: { errors },
    isSubmitting,
    handleSubmit,
  } = useFormCategoty();
  return (
    <div className="mt-2">
      <form onSubmit={handleSubmit}>
        {/* Nombre categoría */}
        <InputField
          type="text"
          placeholder="Nombre de la categoria"
          helpText="Nombre de la categoria"
          regexType="alphanumeric"
          {...register("name")}
          className="mt-2"
          sizeHelp="xs"
          inputSize="md"
          rounded="md"
          errorMessage={errors.name?.message}
        />

        <TextAreaField
          className="bg-gray-200 mt-2"
          {...register("description")}
          helpText="Describe el tipo de gasto"
          placeholder="Describe el tipo de gasto"
        />

        {/* Botones */}
        <Button
          type="submit"
          size="full"
          colVariant="warning"
          className="mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar Categoria"}
        </Button>
      </form>
    </div>
  );
}

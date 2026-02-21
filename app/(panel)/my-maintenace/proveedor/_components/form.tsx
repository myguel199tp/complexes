import React from "react";
import {
  Button,
  InputField,
  SelectField,
  Text,
} from "complexes-next-components";
import { useFormProvider } from "./use-form";
import { useRegisterOptions } from "./regster-options";
// import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function Form() {
  const {
    register,
    formState: { errors },
    isSubmitting,
    handleSubmit,
    setValue,
    watch,
  } = useFormProvider();

  const { indicativeOptions } = useRegisterOptions();
  // const { t } = useTranslation();
  const { language } = useLanguage();

  const hasContract = watch("hasContract");

  return (
    <div className="mt-4" key={language}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* INFORMACIÓN BÁSICA */}
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            type="text"
            placeholder="Nombre del proveedor"
            helpText="Nombre del proveedor"
            {...register("name")}
            inputSize="md"
            rounded="md"
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />

          <InputField
            type="text"
            placeholder="Número de Nit"
            helpText="Número Nit"
            {...register("nit")}
            inputSize="md"
            rounded="md"
            hasError={!!errors.nit}
            errorMessage={errors.nit?.message}
          />
        </div>

        <InputField
          {...register("webPage")}
          placeholder="Página web"
          helpText="Página web"
          inputSize="md"
          rounded="md"
          hasError={!!errors.webPage}
          errorMessage={errors.webPage?.message}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            type="text"
            placeholder="Nombre de contacto"
            helpText="Nombre de contacto"
            {...register("contactName")}
            inputSize="md"
            rounded="md"
            hasError={!!errors.contactName}
            errorMessage={errors.contactName?.message}
          />

          <InputField
            type="text"
            placeholder="Servicio del proveedor"
            helpText="Servicio del proveedor"
            {...register("service")}
            inputSize="md"
            rounded="md"
            hasError={!!errors.service}
            errorMessage={errors.service?.message}
          />
        </div>

        {/* CONTRATO */}
        <div className="border rounded-xl p-4 space-y-4 bg-gray-50">
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("hasContract")}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-cyan-800 transition-colors"></div>
              <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full border transition-transform peer-checked:translate-x-full"></div>
            </label>
            <Text size="sm">Tiene contrato</Text>
          </div>

          {hasContract && (
            <div className="grid md:grid-cols-2 gap-4">
              <InputField
                type="date"
                helpText="Fecha inicio contrato"
                {...register("contractStartDate")}
                inputSize="md"
                rounded="md"
                hasError={!!errors.contractStartDate}
                errorMessage={errors.contractStartDate?.message}
              />

              <InputField
                type="date"
                helpText="Fecha fin contrato"
                {...register("contractEndDate")}
                inputSize="md"
                rounded="md"
                hasError={!!errors.contractEndDate}
                errorMessage={errors.contractEndDate?.message}
              />
            </div>
          )}
        </div>

        {/* CONTACTO */}
        <InputField
          type="email"
          placeholder="Correo electrónico"
          helpText="Correo electrónico"
          {...register("email")}
          inputSize="md"
          rounded="md"
          hasError={!!errors.email}
          errorMessage={errors.email?.message}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <SelectField
            defaultOption="Indicativo"
            helpText="Indicativo"
            options={indicativeOptions}
            id="indicative"
            {...register("indicative")}
            onChange={(e) => {
              setValue("indicative", e.target.value, {
                shouldValidate: true,
              });
            }}
            hasError={!!errors.indicative}
            errorMessage={errors.indicative?.message}
          />

          <InputField
            placeholder="Celular"
            helpText="Celular"
            type="text"
            {...register("phone")}
            inputSize="md"
            rounded="md"
            hasError={!!errors.phone}
            errorMessage={errors.phone?.message}
          />
        </div>

        <Button
          type="submit"
          size="full"
          colVariant="warning"
          className="mt-4"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Guardando..." : "Guardar Proveedor"}
        </Button>
      </form>
    </div>
  );
}

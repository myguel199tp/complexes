import React from "react";
import { Button, InputField, SelectField } from "complexes-next-components";
import { useFormProvider } from "./use-form";
import { useRegisterOptions } from "./regster-options";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function Form() {
  const {
    register,
    formState: { errors },
    isSubmitting,
    handleSubmit,
    setValue,
  } = useFormProvider();
  const { indicativeOptions } = useRegisterOptions();
  const { t } = useTranslation();
  const { language } = useLanguage();
  return (
    <div className="mt-1" key={language}>
      <form onSubmit={handleSubmit}>
        <InputField
          type="text"
          placeholder="Nombre del proveedor"
          helpText="Nombre del proveedor"
          {...register("name")}
          className="mt-2"
          sizeHelp="xs"
          inputSize="md"
          rounded="md"
          errorMessage={errors.name?.message}
        />

        <InputField
          type="text"
          placeholder="Servicio del proveedor"
          helpText="Servicio del proveedor"
          {...register("service")}
          className="mt-2"
          sizeHelp="xs"
          inputSize="md"
          rounded="md"
          errorMessage={errors.service?.message}
        />

        <InputField
          className="mt-2"
          {...register("email")}
          placeholder="Correo electronico"
          helpText="Correo electronico"
          sizeHelp="xs"
          inputSize="md"
          rounded="md"
          hasError={!!errors.email}
          errorMessage={errors.email?.message}
        />

        <div className="block md:!flex items-center gap-3 mt-2">
          <SelectField
            tKeyDefaultOption={t("indicativo")}
            tKeyHelpText={t("indicativo")}
            searchable
            regexType="alphanumeric"
            defaultOption="Indicativo"
            helpText="Indicativo"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            id="indicative"
            options={indicativeOptions}
            {...register("indicative")}
            onChange={(e) => {
              setValue("indicative", e.target.value, {
                shouldValidate: true,
              });
            }}
            tKeyError={t("idicativoRequerido")}
            hasError={!!errors.indicative}
            errorMessage={errors.indicative?.message}
          />
          <InputField
            required
            tKeyHelpText={t("celular")}
            tKeyPlaceholder={t("celular")}
            placeholder="Celular"
            helpText="Celular"
            regexType="phone"
            sizeHelp="xs"
            inputSize="md"
            rounded="md"
            type="text"
            {...register("phone", {
              required: t("celularRequerido"),
              pattern: {
                value: /^[0-9]+$/,
                message: t("soloNumeros"),
              },
            })}
            tKeyError={t("celularRequerido")}
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
          {isSubmitting ? "Guardando..." : "Guardar Área"}
        </Button>
      </form>
    </div>
  );
}

import { useCountryCityOptions } from "@/app/(dashboard)/registers/_components/register-option";
import {
  Button,
  InputField,
  SelectField,
  Text,
} from "complexes-next-components";
import React from "react";
import { useTranslation } from "react-i18next";

export default function Form() {
  const { t } = useTranslation();
  const {
    countryOptions,
    cityOptions,
    indicativeOptions,
    setSelectedCountryId,
  } = useCountryCityOptions();

  // Datos de ejemplo solo para maquetar los acompañantes
  const dummyFields = [{ id: 1, nameComplet: "", numberId: "", relation: "" }];

  return (
    <form>
      <div className="h-[520px] overflow-y-auto overflow-x-hidden rounded-md p-2">
        <InputField
          placeholder={t("nombre")}
          helpText={t("nombre")}
          sizeHelp="xs"
          inputSize="sm"
          rounded="lg"
          className="mt-2"
          type="text"
        />

        <InputField
          placeholder={t("apellido")}
          helpText={t("apellido")}
          sizeHelp="xs"
          inputSize="sm"
          rounded="lg"
          className="mt-2"
          type="text"
        />

        <InputField
          placeholder={t("nuemroIdentificacion")}
          helpText={t("nuemroIdentificacion")}
          sizeHelp="xs"
          inputSize="sm"
          rounded="lg"
          className="mt-2"
          type="number"
        />

        <div className="block md:!flex items-center gap-3 mt-2">
          <SelectField
            tKeyDefaultOption={t("indicativo")}
            tKeyHelpText={t("indicativo")}
            searchable
            defaultOption="Indicativo"
            helpText="Indicativo"
            sizeHelp="xs"
            id="indicative"
            options={indicativeOptions}
            inputSize="sm"
            rounded="lg"
          />
          <InputField
            required
            tKeyHelpText={t("celular")}
            tKeyPlaceholder={t("celular")}
            placeholder="Celular"
            helpText="Celular"
            sizeHelp="xs"
            inputSize="sm"
            rounded="lg"
            type="text"
          />
        </div>

        <InputField
          placeholder={t("correo")}
          helpText={t("correo")}
          sizeHelp="xs"
          inputSize="sm"
          rounded="lg"
          className="mt-2"
          type="email"
        />

        <div className="mt-2">
          <SelectField
            defaultOption="Pais"
            helpText="Pais"
            sizeHelp="xs"
            id="country"
            options={countryOptions}
            inputSize="sm"
            rounded="lg"
            onChange={(e) => setSelectedCountryId(e.target.value || null)}
          />
        </div>

        <div className="mt-2">
          <SelectField
            defaultOption="Ciudad"
            helpText="Ciudad"
            sizeHelp="xs"
            id="city"
            options={cityOptions}
            inputSize="sm"
            rounded="lg"
          />
        </div>

        <InputField
          placeholder={t("numeroPlaca")}
          label="Posee vehículo"
          helpText={t("numeroPlaca")}
          sizeHelp="xs"
          inputSize="sm"
          rounded="lg"
          className="mt-2"
          type="text"
        />

        {/* Sección acompañantes */}
        <div className="mt-4 border p-2 rounded-md w-full bg-gray-100">
          <Text size="sm" font="bold" className="mt-2" translate="yes">
            Acompañantes
          </Text>

          {dummyFields.map((field) => (
            <div
              key={field.id}
              className="items-center flex gap-2 mb-2 border-b pb-2"
            >
              <div className="w-full">
                <InputField
                  helpText="Nombre completo"
                  className="mt-2"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="lg"
                  type="text"
                />

                <InputField
                  helpText="Número de identificación"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="lg"
                  className="mt-2"
                  type="text"
                />
              </div>

              <div className="w-full">
                <InputField
                  helpText="Relación con huesped principal"
                  sizeHelp="xs"
                  inputSize="sm"
                  rounded="lg"
                  className="mt-2"
                  type="text"
                />
              </div>

              <Button
                type="button"
                size="sm"
                colVariant="danger"
                onClick={() => console.log("Eliminar")}
              >
                {t("eliminar")}
              </Button>
            </div>
          ))}

          <Button
            type="button"
            size="sm"
            colVariant="primary"
            onClick={() => console.log("Añadir acompañante")}
          >
            Añadir
          </Button>
        </div>
      </div>

      <div className="flex justify-start items-start gap-4 mt-4 border-t pt-1">
        <Button colVariant="danger" size="sm" rounded="lg">
          Cancelar
        </Button>
        <Button colVariant="warning" size="sm" rounded="lg">
          Continuar
        </Button>
      </div>
    </form>
  );
}

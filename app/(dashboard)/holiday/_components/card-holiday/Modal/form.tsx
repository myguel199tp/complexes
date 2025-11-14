"use client";
import {
  Button,
  InputField,
  SelectField,
  Text,
} from "complexes-next-components";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { IoImages } from "react-icons/io5";
import PaymentPage from "./paymentPage";
import { useCountryCityOptions } from "@/app/(sets)/registers/_components/register-option";

export default function Form() {
  const { t } = useTranslation();
  const {
    countryOptions,
    cityOptions,
    indicativeOptions,
    setSelectedCountryId,
  } = useCountryCityOptions();

  // Estado para mostrar formulario o pago
  const [showForm, setShowForm] = useState(true); // inicialmente mostramos el formulario
  const [companions, setCompanions] = useState<
    { id: number; nameComplet: string; numberId: string; relation: string }[]
  >([{ id: 1, nameComplet: "", numberId: "", relation: "" }]);

  const handleAddCompanion = () => {
    setCompanions((prev) => [
      ...prev,
      { id: Date.now(), nameComplet: "", numberId: "", relation: "" },
    ]);
  };

  const handleRemoveCompanion = (id: number) => {
    setCompanions((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div>
      {showForm ? (
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

            <section className="flex gap-2 w-full bg-slate-500">
              <div className="w-full">
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
                    onChange={(e) =>
                      setSelectedCountryId(e.target.value || null)
                    }
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
                  type="text"
                />
              </div>
              <div className="w-full">
                <IoImages size={150} className="cursor-pointer text-gray-300" />
              </div>
            </section>

            {/* Sección acompañantes */}
            <div className="mt-4 border p-2 rounded-md w-full bg-gray-100">
              <Text size="sm" font="bold" className="mt-2" translate="yes">
                Acompañantes
              </Text>

              {companions.map((field) => (
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
                      value={field.nameComplet}
                      onChange={(e) =>
                        setCompanions((prev) =>
                          prev.map((f) =>
                            f.id === field.id
                              ? { ...f, nameComplet: e.target.value }
                              : f
                          )
                        )
                      }
                    />

                    <InputField
                      helpText="Número de identificación"
                      sizeHelp="xs"
                      inputSize="sm"
                      rounded="lg"
                      className="mt-2"
                      type="text"
                      value={field.numberId}
                      onChange={(e) =>
                        setCompanions((prev) =>
                          prev.map((f) =>
                            f.id === field.id
                              ? { ...f, numberId: e.target.value }
                              : f
                          )
                        )
                      }
                    />
                  </div>

                  <div className="w-full">
                    <InputField
                      helpText="Relación con huésped principal"
                      sizeHelp="xs"
                      inputSize="sm"
                      rounded="lg"
                      className="mt-2"
                      type="text"
                      value={field.relation}
                      onChange={(e) =>
                        setCompanions((prev) =>
                          prev.map((f) =>
                            f.id === field.id
                              ? { ...f, relation: e.target.value }
                              : f
                          )
                        )
                      }
                    />
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    colVariant="danger"
                    onClick={() => handleRemoveCompanion(field.id)}
                  >
                    {t("eliminar")}
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                size="sm"
                colVariant="primary"
                onClick={handleAddCompanion}
              >
                Añadir
              </Button>
            </div>
          </div>

          <div className="flex justify-start items-start gap-4 mt-4 border-t pt-1">
            <Button
              colVariant="warning"
              size="sm"
              rounded="lg"
              onClick={() => setShowForm(false)} // Aquí ocultamos el formulario y mostramos el pago
            >
              Continuar
            </Button>
          </div>
        </form>
      ) : (
        <PaymentPage /> // Solo se carga después de dar Continuar
      )}
    </div>
  );
}

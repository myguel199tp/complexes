import React from "react";
import {
  Button,
  Buton,
  InputField,
  Text,
  TextAreaField,
} from "complexes-next-components";
import { useFormForo } from "./use-form";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/hooks/useLanguage";

export default function ForumForm() {
  const {
    register,
    pollsFields,
    optionFieldArrays,
    formState: { errors },
    handleSubmit,
  } = useFormForo();
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <form key={language} className="mt-4 space-y-4" onSubmit={handleSubmit}>
      <div>
        <InputField
          {...register("title")}
          placeholder={t("titulo")}
          regexType="alphanumeric"
          helpText={t("titulo")}
          sizeHelp="xs"
          inputSize="md"
          rounded="md"
          errorMessage={errors.title?.message}
        />
      </div>

      <div>
        <TextAreaField
          {...register("content")}
          regexType="alphanumeric"
          className="bg-gray-200 w-full p-4 rounded-md"
          placeholder={t("contenido")}
          errorMessage={errors?.content?.message}
        />
      </div>

      <div>
        <InputField
          {...register("createdBy")}
          placeholder={t("creadopor")}
          helpText={t("creadopor")}
          regexType="alphanumeric"
          sizeHelp="xs"
          inputSize="sm"
          rounded="md"
          errorMessage={errors?.createdBy?.message}
        />
      </div>

      {/* Encuestas dinámicas */}
      {pollsFields.map((poll, pollIndex) => {
        const optionsArray = optionFieldArrays[pollIndex];
        return (
          <div key={poll.id} className="border p-4 rounded-md space-y-2">
            <div className="flex justify-between items-center">
              <Text font="bold" size="sm">
                {t("encuesta")} {pollIndex + 1}
              </Text>
            </div>

            <InputField
              {...register(`polls.${pollIndex}.question` as const)}
              placeholder={t("pregunta")}
              regexType="alphanumeric"
              helpText={t("pregunta")}
              sizeHelp="xs"
              inputSize="sm"
              rounded="md"
            />

            {errors.polls?.[pollIndex]?.question && (
              <Text colVariant="danger" size="xs">
                {errors.polls[pollIndex]?.question?.message}
              </Text>
            )}

            {/* Opciones dinámicas */}
            {optionsArray.fields.map((opt, optIndex) => (
              <div key={opt.id} className="flex items-center space-x-2">
                <InputField
                  {...register(
                    `polls.${pollIndex}.options.${optIndex}.option` as const
                  )}
                  placeholder={`${t("opcion")} ${optIndex + 1}`}
                  helpText={`${t("opcion")} ${optIndex + 1}`}
                  sizeHelp="xs"
                  regexType="alphanumeric"
                  inputSize="sm"
                  rounded="md"
                />

                <Button
                  type="button"
                  colVariant="danger"
                  size="sm"
                  rounded="lg"
                  onClick={() => optionsArray.remove(optIndex)}
                >
                  X
                </Button>
              </div>
            ))}

            {errors.polls?.[pollIndex]?.options && (
              <Text colVariant="danger" size="xs">
                {errors.polls[pollIndex]?.options?.message}
              </Text>
            )}

            <Buton
              type="button"
              tKey={t("agregarOpcion")}
              colVariant="default"
              borderWidth="none"
              size="sm"
              className="hover:bg-gray-400"
              onClick={() => optionsArray.append({ option: "" })}
            >
              Añadir opción
            </Buton>
          </div>
        );
      })}

      <Button
        type="submit"
        colVariant="warning"
        size="full"
        className="mt-4"
        tKey={t("crearHilo")}
      >
        Crear encuesta
      </Button>
    </form>
  );
}
